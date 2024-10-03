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
import { GiHamburgerMenu } from "react-icons/gi";

const RoomPage = () => {
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [isRoomAvailable, setIsRoomAvailable] = useState(false);
  const [roomInfo, setRoomInfo] = useState({});
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

  // Scroll to the latest message when messages update
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if the room exists and belongs to the authenticated user
  useEffect(() => {
    const checkRoomName = async () => {
      if (!roomId || !auth.currentUser) return;

      try {
        const roomsQ = query(
          roomsColl,
          where("roomId", "==", roomId),
          where("users", "array-contains", auth.currentUser.uid) // Check if the user is a member of the room
        );
        const querySnapshot = await getDocs(roomsQ);
        setRoomInfo(querySnapshot.docs[0]?.data()); // Store room info in state
        setIsRoomAvailable(!querySnapshot.empty); // Set availability based on whether room exists
      } catch (error) {
        console.error("Error checking room:", error.message);
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
        userName: auth.currentUser.displayName,
        roomId, // Save the room ID to associate the message with the room
      });
      const textArea = textAreaRef.current;
      if (textArea) textArea.style.height = "auto"; // Reset height after submission
      setNewMessage(""); // Clear the input field after submission
    } catch (error) {
      console.error("Error sending message:", error.message);
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

      // Sort messages by 'createdAt' timestamp, ensuring valid timestamps
      const sortedMessages = fetchedMessages
        .filter((msg) => msg.createdAt) // Filter out messages without timestamps
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()); // Ascending order (older messages first)

      setMessages(sortedMessages); // Store the sorted messages in state
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [roomId]);

  // Handle Enter key press to submit message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior of Enter key (newline)
      handleSubmit(e); // Submit the message
    }
  };

  return (
    <div className="room-page">
      {isRoomAvailable ? (
        <>
          <div className="room-header">
            <h1>{roomInfo.name}</h1>
            <button>
              <GiHamburgerMenu />
            </button>
            {/* 
                        <div className="users">
              {roomInfo.usersNames?.map((name) => (
                <p key={name}>{name}</p>
              ))}
            </div>
             */}
          </div>
          <div className="messages" ref={messagesRef}>
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBox
                  key={message.id}
                  message={message.message}
                  who={message.user === auth.currentUser.uid}
                  userName={message.userName}
                  time={message.createdAt}
                  profileImage="https://via.placeholder.com/150" // Placeholder for profile image
                />
              ))
            ) : (
              <p>No messages yet...</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="message-form">
            <textarea
              ref={textAreaRef}
              placeholder="Type a message"
              value={newMessage}
              className="message-input"
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setNewMessage(e.target.value);
                adjustTextAreaHeight(); // Adjust height as text is typed
              }}
              rows="1" // Minimum rows, auto grows
              style={{ resize: "none", overflow: "hidden" }} // Disable manual resizing
            />
            <button type="submit" disabled={!newMessage.trim()}>
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
