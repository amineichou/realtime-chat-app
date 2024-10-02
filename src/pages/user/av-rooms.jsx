import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import "./styles/av-rooms.css";

const AvRooms = () => {
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
          <p>No rooms available, you can create one :)</p>
        )}
      </div>
    </div>
  );
};

export default AvRooms;
