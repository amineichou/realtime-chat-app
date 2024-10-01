import React, { useEffect, useState } from "react";
import "./styles/room-page.css";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase-config";
import { useParams } from "react-router-dom";

const RoomPage = () => {
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [isRoomAvailable, setIsRoomAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const roomsColl = collection(db, "rooms");
  const messagesColl = collection(db, "messages");

  // Check if the room exists and belongs to the authenticated user
  useEffect(() => {
    if (!roomId || !auth.currentUser) return;

    const checkRoomName = async () => {
      try {
        const roomsQ = query(
          roomsColl,
          where("name", "==", roomId),
          where("by", "==", auth.currentUser.uid) // Check if the user created the room
        );
        const querySnapshot = await getDocs(roomsQ);

        setIsRoomAvailable(!querySnapshot.empty); // Set availability based on whether room exists
      } catch (error) {
        console.error("Error checking room:", error);
        setIsRoomAvailable(false);
      }
    };

    checkRoomName();
  }, [roomId, auth.currentUser]);

  // Handle message form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      await addDoc(messagesColl, {
        message: newMessage,
        createdAt: serverTimestamp(),
        user: auth.currentUser.uid,
        roomId, // Save the room ID to associate the message with the room
      });
      setNewMessage(""); // Clear the input field after submission
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch and listen to messages for the current room
  useEffect(() => {
    if (!roomId) return;

    const queryMessages = query(messagesColl, where("roomId", "==", roomId)); // Query messages for the current room

    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages); // Store the messages in state
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [roomId]);

  return (
    <div className="room-page">
      {isRoomAvailable ? (
        <>
          <h1>{roomId}</h1>
          <div className="messages">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="message">
                  <strong>{message.user}:</strong> {message.message}
                </div>
              ))
            ) : (
              <p>No messages yet...</p>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <h1>Room Not Found</h1>
      )}
    </div>
  );
};

export default RoomPage;
