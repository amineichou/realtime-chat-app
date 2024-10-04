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
import { BallTriangle } from "react-loader-spinner";

const RoomPage = () => {
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [isRoomAvailable, setIsRoomAvailable] = useState(false);
  const [roomInfo, setRoomInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const textAreaRef = useRef(null);
  const messagesRef = useRef(null);

  // Adjust the textarea height based on content, but limit to 720px
  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto";
      const newHeight = textArea.scrollHeight;
      if (newHeight > 720) {
        textArea.style.height = "720px";
        textArea.style.overflowY = "auto";
      } else {
        textArea.style.height = `${newHeight}px`;
        textArea.style.overflowY = "hidden";
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
          collection(db, "rooms"),
          where("roomId", "==", roomId),
          where("users", "array-contains", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(roomsQ);
        if (!querySnapshot.empty) {
          setRoomInfo(querySnapshot.docs[0].data() || {});
          setIsRoomAvailable(true);
        } else {
          setIsRoomAvailable(false);
        }
      } catch (error) {
        console.error("Error checking room:", error.message);
        setIsRoomAvailable(false);
        setIsFetching(false);
      }
    };

    checkRoomName();
  }, [roomId, auth.currentUser]);

  // Handle message form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
        user: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        roomId,
      });

      // Reset textarea height and clear message input
      if (textAreaRef.current) textAreaRef.current.style.height = "auto";
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  // Fetch and listen to messages for the current room
  useEffect(() => {
    if (!roomId || !isRoomAvailable) return;

    const queryMessages = query(
      collection(db, "messages"),
      where("roomId", "==", roomId)
    );

    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.createdAt) // Ensure valid createdAt timestamp
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [roomId, isRoomAvailable]);

  // Handle Enter key press to submit message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="room-page">
      
      {isRoomAvailable ? (
        <>
          <div className="room-header">
            <h1>{roomInfo.name || "Room"}</h1>
            {/* <button>
              <GiHamburgerMenu />
            </button> */}
          </div>
          <div className="messages" ref={messagesRef}>
            <p className="room-createdAt">
              {
                // createAt
                "Created at: " +
                  new Date(roomInfo.createdAt?.seconds * 1000).toLocaleString()
              }
            </p>
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
                adjustTextAreaHeight();
              }}
              rows="1"
              style={{ resize: "none", overflow: "hidden" }}
            />
            <button type="submit" disabled={!newMessage.trim()}>
              <IoSend />
            </button>
          </form>
        </>
      ) : isFetching ? (
        <div className="loading">
          <BallTriangle
            visible={true}
            height={100}
            width={100}
            color="#2B9FFF"
            backgroundColor="#e20b0b"
          />
        </div>
      ) : (
        <p>Room not found or you don't have access.</p>
      )}
    </div>
  );
};

export default RoomPage;
