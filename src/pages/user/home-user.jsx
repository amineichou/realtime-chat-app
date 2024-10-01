import React, { useEffect, useRef, useState } from "react";
import "./styles/home-user.css";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { Link } from "react-router-dom";

const AddRoom = () => {
  const roomInputRef = useRef(null);
  const roomsColl = collection(db, "rooms");

  const addRoomdb = async () => {
    const roomName = roomInputRef.current.value.trim();
    if (roomName === "") {
      return;
    }
    roomInputRef.current.value = "";
    try {
      await addDoc(roomsColl, {
        name: roomName,
        by: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding room: ", error);
    }
  };

  return (
    <div className="add-room">
      <input type="text" placeholder="Room Name" ref={roomInputRef} />
      <button onClick={addRoomdb}>Add Room</button>
    </div>
  );
};

const HomeUser = () => {
  const [rooms, setRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const roomsColl = collection(db, "rooms");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const queryRooms = query(roomsColl, where("by", "==", currentUser.uid));
    const unsubscribe = onSnapshot(
      queryRooms,
      (snapshot) => {
        setRooms(snapshot.docs.map((doc) => doc.data()));
      },
      (error) => {
        console.error("Error fetching rooms: ", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="home-user">
      <div className="rooms">
        <p>Create Rooms and invite your friends to join the room and chat with them.</p>
        <AddRoom />
      </div>
      <div className="myrooms">
        <h2>My Rooms</h2>
        <div className="myrooms-list">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Link to={`/rooms/${room.name}`} key={room.name} className="room">
                {room.name}
              </Link>
            ))
          ) : (
            <p>No rooms available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
