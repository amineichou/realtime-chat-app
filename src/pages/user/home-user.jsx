import React, { useRef } from "react";
import "./styles/home-user.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import AvRooms from "./av-rooms";

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
        roomId:
          "hangout-rooms-" +
          roomName.toLowerCase().replace(/\s/g, "-") +
          "-" +
          Date.now() +
          "-" +
          Math.floor(Math.random() * 1000) +
          "-" +
          Math.floor(Math.random() * 1000),
        by: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        users: [auth.currentUser.uid],
      });
    } catch (error) {
      console.error("Error adding room: ", error);
    }
  };

  return (
    <div className="add-room">
      <p>Create Rooms and invite your friends to join.</p>
      <input type="text" placeholder="Room Name" ref={roomInputRef} />
      <button onClick={addRoomdb}>Create Room</button>
    </div>
  );
};

const JoinRoom = () => {
  return (
    <div className="join-room">
      <p>Join Rooms and chat with friends.</p>
      <input type="text" placeholder="Room Name" />
      <button>Join Room</button>
    </div>
  );
};

const HomeUser = () => {
  return (
    <div className="home-user">
      <div className="rooms-gen">
        <AddRoom />
        <JoinRoom />
      </div>
      <AvRooms />
    </div>
  );
};

export default HomeUser;
