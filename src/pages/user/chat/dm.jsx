import React, { useEffect, useRef, useState } from "react";
import "./styles/room.css";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase-config";
import MessageBox from "../../../components/message-box";
import { IoSend } from "react-icons/io5";
import { BallTriangle } from "react-loader-spinner";

const Dm = (params) => {
  const { dmId } = params;
  const [newMessage, setNewMessage] = useState("");
  const [isDmAvailable, setIsDmAvailable] = useState(false);
  const [dmInfo, setDmInfo] = useState({});
  const [otherUser, setOtherUser] = useState(null); // State to hold the other user's data
  const [messages, setMessages] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSending, setIsSending] = useState(false); // Flag to track if a message is being sent
  const textAreaRef = useRef(null);
  const messagesRef = useRef(null);

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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const checkDm = async () => {
      if (!dmId || !auth.currentUser) {
        console.log("No DM ID or user is authenticated");
        setIsFetching(false);
        return;
      }

      try {
        const dmRef = doc(db, "dms", dmId);
        const dmSnapshot = await getDoc(dmRef);

        if (dmSnapshot.exists()) {
          const dmData = dmSnapshot.data();

          if (dmData.users && dmData.users.includes(auth.currentUser.uid)) {
            setDmInfo(dmData);
            setIsDmAvailable(true);

            // Fetch the other user's data
            const otherUserId = dmData.users.find(
              (userId) => userId !== auth.currentUser.uid
            );
            const otherUserData = await fetchUserData(otherUserId);
            setOtherUser(otherUserData); // Store other user data
          } else {
            console.log("User does not have access to this DM");
            setIsDmAvailable(false);
          }
        } else {
          console.log("No matching DM found");
          setIsDmAvailable(false);
        }
      } catch (error) {
        console.error("Error checking DM:", error.message);
        setIsDmAvailable(false);
      } finally {
        setIsFetching(false);
      }
    };

    checkDm();
  }, [dmId, auth.currentUser]);

  const fetchUserData = async (userId) => {
    try {
      const usersCollection = collection(db, "users");
      const userQuery = query(usersCollection, where("id", "==", userId));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || isSending) return; // Prevent sending if a message is already being sent

    if (otherUser.status === "deleted") {
      console.log("Cannot send message to a deleted user.");
      return;
    }

    setIsSending(true); // Set sending flag to true

    try {
      const currentUserData = await fetchUserData(auth.currentUser.uid);

      await addDoc(collection(db, "messages"), {
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
        user: auth.currentUser.uid,
        userName: currentUserData?.username || "Anonymous",
        userPhoto: currentUserData?.image || null,
        dmId,
      });

      if (textAreaRef.current) textAreaRef.current.style.height = "auto";
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    } finally {
      setIsSending(false); // Set sending flag to false after message is sent
    }
  };

  useEffect(() => {
    if (!dmId || !isDmAvailable) return;

    const queryMessages = query(
      collection(db, "messages"),
      where("dmId", "==", dmId)
    );

    const unsubscribe = onSnapshot(queryMessages, async (snapshot) => {
      const fetchedMessages = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const messageData = doc.data();
          const userData = await fetchUserData(messageData.user);

          return {
            id: doc.id,
            ...messageData,
            userPhoto: userData?.image || null,
            userName: userData?.username || "Anonymous",
          };
        })
      );

      const sortedMessages = fetchedMessages
        .filter((msg) => msg.createdAt)
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

      setMessages(sortedMessages);
    });

    return () => unsubscribe();
  }, [dmId, isDmAvailable]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="dm">
      {isFetching ? (
        <div className="loading">
          <BallTriangle
            visible={true}
            height={100}
            width={100}
            color="#2B9FFF"
            backgroundColor="#e20b0b"
          />
        </div>
      ) : isDmAvailable ? (
        <>
          <div className="dm-header">
            <h1>
              {otherUser.status === "deleted"
                ? "Deleted User"
                : otherUser?.fullName || otherUser?.username}
            </h1>
          </div>
          <div className="messages" ref={messagesRef}>
            <p className="dm-createdAt">
              {"Created at: " +
                new Date(dmInfo.createdAt?.seconds * 1000).toLocaleString()}
            </p>
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBox
                  key={message.id}
                  message={message.message}
                  who={message.user === auth.currentUser.uid}
                  userName={message.userName}
                  time={message.createdAt}
                  profileImage={message.userPhoto}
                  status={otherUser.status}
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
              disabled={isSending || otherUser.status === "deleted"} // Disable while sending
              style={{
                resize: "none",
                overflow: "hidden",
                backgroundColor: "#fff",
                cursor:
                  isSending || otherUser.status === "deleted"
                    ? "not-allowed"
                    : "text",
              }}
            />
            <button
              style={{
                cursor:
                  isSending || otherUser.status === "deleted"
                    ? "not-allowed"
                    : "pointer",
              }}
              type="submit"
              disabled={
                isSending ||
                !newMessage.trim() ||
                otherUser.status === "deleted"
              } // Disable if already sending
            >
              <IoSend />
            </button>
          </form>
        </>
      ) : (
        <p>DM not found or you don't have access.</p>
      )}
    </div>
  );
};

export default Dm;
