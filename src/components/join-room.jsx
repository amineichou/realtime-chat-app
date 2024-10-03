import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../firebase-config";
import { Toast } from "../pages/utils";
import Swal from "sweetalert2";
import "../styles-global/create-join.css";
import { IoClose } from "react-icons/io5";

const JoinRoom = (params) => {
  const { displayBox, setDisplayBox } = params;
  const [roomId, setRoomId] = useState(""); // State for the room ID input
  const roomsColl = collection(db, "rooms"); // Firestore collection reference

  // Function to update a field in a document
  async function updateRoomField(documentId, fieldName, newValue) {
    try {
      const roomDoc = doc(roomsColl, documentId);
      const updateData = {
        [fieldName]: newValue,
      };
      await updateDoc(roomDoc, updateData);
    } catch (error) {
      console.error("Error updating document:", error);
      Toast.fire({
        icon: "error",
        title: "Error joining room. Please try again.",
      });
    }
  }

  // Function to handle room joining
  const handleJoinRoom = async () => {
    if (!roomId) {
      Toast.fire({
        icon: "error",
        title: "Please enter a room ID.",
      });
      return;
    }

    const roomsQuery = query(
      roomsColl,
      where("roomId", "==", roomId) // Query to find room by ID
    );

    try {
      const querySnapshot = await getDocs(roomsQuery);

      if (querySnapshot.empty) {
        Swal.fire({
          title: "Error!",
          text: "Room not found. Please check the ID and try again.",
          icon: "error",
        });
      } else {
        const roomData = querySnapshot.docs[0].data();
        const currentUserId = auth.currentUser.uid;
        const roomUsers = roomData.users;

        if (roomUsers.includes(currentUserId)) {
        } else {
          // Room exists and user is not part of the room

          // Update the room to add the current user
          updateRoomField(querySnapshot.docs[0].id, "users", [
            ...roomUsers,
            currentUserId,
          ]);

          // Update the room to add the current user's name
          updateRoomField(querySnapshot.docs[0].id, "usersNames", [
            ...roomData.usersNames,
            auth.currentUser.displayName,
          ]);

          setDisplayBox(false); // Close the join room box

          Swal.fire({
            title: "Success!",
            text: "Joined Room Successfully",
            icon: "success",
          });

          // Navigate to the room (optional)
          // navigate(`/rooms/${roomId}`);
        }
      }
    } catch (error) {
      console.error("Error joining room:", error);
      Toast.fire({
        icon: "error",
        title: "Error joining room. Please try again.",
      });
    }
  };

  return (
    <>
      <div
        className="join-room-container"
        style={{ display: displayBox ? "flex" : "none" }}
      >
        <div className="join-room">
          <button
            className="close"
            onClick={() => {
              setDisplayBox(false);
            }}
          >
            <IoClose />
          </button>
          <h2>Join Room</h2>
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)} // Update state on input change
          />
          <button onClick={handleJoinRoom}>Join Room</button>
          {/* {message && <p className="feedback-message">{message}</p>} */}
          {/* Display feedback messages */}
        </div>
      </div>
    </>
  );
};

export default JoinRoom;
