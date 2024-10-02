import React, { useEffect, useRef, useState } from "react";
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
import MessageBox from "../../../components/message-box";
import { IoSend } from "react-icons/io5";
import { text } from "framer-motion/client";

const RoomPage = () => {
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [isRoomAvailable, setIsRoomAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const roomsColl = collection(db, "rooms");
  const messagesColl = collection(db, "messages");
  const textAreaRef = useRef(null);
  const messagesRef = useRef(null);

  // Adjust the textarea height based on content, but limit to 720px
  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto"; // Reset height before calculating
      const newHeight = textArea.scrollHeight;

      // Set height to fit content but cap at 720px
      if (newHeight > 720) {
        textArea.style.height = "720px"; // Cap height at 720px
        textArea.style.overflowY = "auto"; // Add scroll if content exceeds 720px
      } else {
        textArea.style.height = newHeight + "px"; // Set height to content size
        textArea.style.overflowY = "hidden"; // Hide scroll if not needed
      }
    }
  };

  // Scroll to the start of the messages when a new message is sent or received
  useEffect(() => {
    // Automatically scroll to the latest message when messages update
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if the room exists and belongs to the authenticated user
  useEffect(() => {
    if (!roomId || !auth.currentUser) return;

    const checkRoomName = async () => {
      try {
        const roomsQ = query(
          roomsColl,
          where("roomId", "==", roomId),
          where("users", "array-contains", auth.currentUser.uid) // Check if the user is a member of the room
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
      const textArea = textAreaRef.current;
      if (textArea) textArea.style.height = "auto"; // Reset height after submission
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

      // Sort messages by 'createdAt' timestamp
      const sortedMessages = fetchedMessages.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0; // Fallback if timestamp is missing
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0; // Fallback if timestamp is missing
        return timeA - timeB; // Ascending order (older messages first)
      });

      setMessages(sortedMessages); // Store the sorted messages in state
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [roomId]);

  return (
    <div className="room-page">
      {isRoomAvailable ? (
        <>
          <div className="room-header">room</div>
          <div className="messages" ref={messagesRef}>
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBox
                  key={message.id}
                  message={message.message}
                  who={message.user === auth.currentUser.uid ? true : false}
                  profileImage="https://via.placeholder.com/150"
                />
              ))
            ) : (
              <p>No messages yet...</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="message-form">
            <textarea
              type="text"
              ref={textAreaRef}
              placeholder="Message"
              value={newMessage}
              className="message-input"
              onChange={(e) => {
                setNewMessage(e.target.value);
                adjustTextAreaHeight(); // Adjust height as text is typed
              }}
              rows="1" // Minimum rows, auto grows
              style={{ resize: "none", overflow: "hidden" }} // Disable manual resizing
            />
            <button type="submit">
              <IoSend />
            </button>
          </form>
        </>
      ) : (
        <h1>Room Not Found</h1>
      )}
    </div>
  );
};

export default RoomPage;
