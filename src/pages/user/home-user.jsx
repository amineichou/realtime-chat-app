import React, { useRef, useState } from "react";
import "./styles/home-user.css";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import AvRooms from "./av-rooms";
import { useNavigate } from "react-router-dom";

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
  const [roomTheme, setRoomTheme] = useState("#2B9FFF"); // Default theme color is red

  // Array of color themes for users to select from
  const colorThemes = ["#2B9FFF", "#6256CA", "#86D293", "#4379F2", "#D91656"];

  // Function to handle adding a room to the database
  const addRoomdb = async () => {
    const roomName = roomInputRef.current.value.trim();
    if (roomName === "" || roomName.length > 30) {
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
      <input
        type="text"
        placeholder="Room Name"
        maxLength="30"
        ref={roomInputRef}
      />
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
  const [roomId, setRoomId] = useState(""); // State for the room ID input
  const [message, setMessage] = useState(""); // State for feedback messages
  const roomsColl = collection(db, "rooms"); // Firestore collection reference
  const navigate = useNavigate();

  // Function to update a field in a document
  async function updateRoomField(documentId, fieldName, newValue) {
    try {
      // Reference to the specific document inside the 'rooms' collection
      const roomDoc = doc(roomsColl, documentId);

      // Create an object with the field to update
      const updateData = {
        [fieldName]: newValue,
      };

      // Update the document
      await updateDoc(roomDoc, updateData);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }

  // Function to handle room joining
  const handleJoinRoom = async () => {
    if (!roomId) {
      setMessage("Please enter a Room ID."); // Check for empty input
      return;
    }

    const roomsQuery = query(
      roomsColl,
      where("roomId", "==", roomId) // Query to find room by ID
    );

    try {
      const querySnapshot = await getDocs(roomsQuery);
      if (querySnapshot.empty) {
        setMessage("Room ID is unavailable."); // Room does not exist
      } else {
        // Room exists
        setMessage(`Successfully joined room "${querySnapshot.docs[0].data().name}".`);
        // Implement navigation or other logic to join the room
        // For example, you can redirect to a specific route
        // navigate(`/rooms/${roomId}`);
        updateRoomField(querySnapshot.docs[0].id, "users", [
          ...querySnapshot.docs[0].data().users,
          auth.currentUser.uid,
        ]);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setMessage("An error occurred while trying to join the room.");
    }
  };

  return (
    <div className="join-room">
      <p>Join Rooms and chat with friends.</p>
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)} // Update state on input change
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      {message && <p className="feedback-message">{message}</p>}
      {/* Display feedback messages */}
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
