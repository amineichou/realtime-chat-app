import React, { useRef, useState } from "react";
import "./styles/home-user.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import AvRooms from "./av-rooms";

const RoomThemeColor = ({ color, selectedTheme, setRoomTheme }) => {
  return (
    <button
      className={selectedTheme === color ? "checked" : ""}
      style={{
        backgroundColor: color,
      }}
      onClick={() => setRoomTheme(color)}
    ></button>
  );
};

const AddRoom = () => {
  const roomInputRef = useRef(null);
  const roomsColl = collection(db, "rooms");
  const [roomTheme, setRoomTheme] = useState("red"); // Default theme color is red

  // Array of color themes for users to select from
  const colorThemes = ["red", "green", "blue", "yellow", "purple"];

  // Function to handle adding a room to the database
  const addRoomdb = async () => {
    const roomName = roomInputRef.current.value.trim();
    if (roomName === "") {
      return;
    }
    roomInputRef.current.value = ""; // Clear input after submission

    try {
      await addDoc(roomsColl, {
        name: roomName,
        roomId:
          "hangout-rooms-" +
          roomName.toLowerCase().replace(/\s/g, "-") +
          "-" +
          Date.now() +
          "-" +
          Math.floor(Math.random() * 1000),
        by: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        users: [auth.currentUser.uid],
        theme: roomTheme, // Include selected theme in the room document
      });
    } catch (error) {
      console.error("Error adding room: ", error);
    }
  };

  return (
    <div className="add-room">
      <p>Create Rooms and invite your friends to join.</p>
      <input type="text" placeholder="Room Name" ref={roomInputRef} />
      <div className="room-theme">
        {colorThemes.map((color) => (
          <RoomThemeColor
            key={color}
            color={color}
            selectedTheme={roomTheme} // Pass selected theme
            setRoomTheme={setRoomTheme} // Pass function to update theme
          />
        ))}
      </div>
      <button onClick={addRoomdb}>Create Room</button>
    </div>
  );
};


const JoinRoom = () => {
  return (
    <div className="join-room">
      <p>Join Rooms and chat with friends.</p>
      <input type="text" placeholder="Room ID" />
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
