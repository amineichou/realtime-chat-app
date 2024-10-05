import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import "./styles/av-rooms.css";
import { IoCopySharp } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { Toast } from "../utils";
import { ImExit } from "react-icons/im";
import { CgMenuGridO } from "react-icons/cg";

const NoRoomAvailable = () => {
  return (
    <div className="no-room">
      <p>No rooms available, you can create one :)</p>
      <img src="/images/3d-chat.webp" alt="vide" />
    </div>
  );
};

const copyToClipboard = (toCopy) => {
  // copy to clipboard roomId
  navigator.clipboard.writeText(toCopy).then(
    function () {
      Toast.fire({
        icon: "success",
        title: "Room ID copied to clipboard!",
      });
    },
    function (err) {
      Toast.fire({
        icon: "error",
        title: "Error copying to clipboard!" + err,
      });
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = toCopy;
      document.body.appendChild(tempTextArea);
      try {
        document.execCommand("copy");
        console.log("Text copied to clipboard");
        Toast.fire({
          icon: "success",
          title: "Room ID copied to clipboard!",
        });
      } catch (err) {
        Toast.fire({
          icon: "error",
          title: "Error copying to clipboard!" + err,
        });
      }
    }
  );
};

const AvRooms = () => {
  const [menu, setMenu] = useState("none");
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

    const queryRooms = query(
      roomsColl,
      where("users", "array-contains", currentUser.uid)
    );
    const unsubscribe = onSnapshot(
      queryRooms,
      (snapshot) => {
        setRooms(snapshot.docs.map((doc) => doc.data()));
      },
      (error) => {
        Toast.fire({
          icon: "error",
          title: "Error fetching rooms: " + error.message,
        });
        console.error("Error fetching rooms: ", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const deleteRoom = async () => {
    // Delete the room
    try {
      const roomId = rooms[0].roomId;
      const roomQuery = query(roomsColl, where("roomId", "==", roomId));
      // Get the room document(s)
      const querySnapshot = await getDocs(roomQuery);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          // Get the document ID and delete the document
          const roomDoc = doc(db, "rooms", docSnapshot.id);
          await deleteDoc(roomDoc);
          console.log("Room deleted successfully!");
        });
      } else {
        console.log("Room not found.");
        Toast.fire({
          icon: "error",
          title: "Room not found!",
        });
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error deleting room: " + error.message,
      });
      console.error("Error deleting room:", error);
    }
  };

  const leaveRoom = async () => {
    // Leave the room
    try {
      const roomId = rooms[0].roomId;
      const roomQuery = query(roomsColl, where("roomId", "==", roomId));
      // Get the room document(s)
      const querySnapshot = await getDocs(roomQuery);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          // Get the document ID
          const roomDoc = doc(db, "rooms", docSnapshot.id);
          const roomData = docSnapshot.data();
          const roomUsers = roomData.users;
          const roomUsersNames = roomData.usersNames;
          const currentUser = auth.currentUser.uid;
          const currentUserIndex = roomUsers.indexOf(currentUser);

          if (currentUserIndex !== -1) {
            // Remove the current user from the users array
            roomUsers.splice(currentUserIndex, 1);
            // Remove the current user's name from the usersNames array
            roomUsersNames.splice(currentUserIndex, 1);

            // Update the room document
            await deleteDoc(roomDoc);
            await setDoc(roomDoc, {
              ...roomData,
              users: roomUsers,
              usersNames: roomUsersNames,
            });
            console.log("Left room successfully!");
            Toast.fire({
              icon: "success",
              title: "Left room successfully!",
            });
          } else {
            console.log("User not found in the room.");
            Toast.fire({
              icon: "error",
              title: "User not found in the room!",
            });
          }
        });
      } else {
        console.log("Room not found.");
        Toast.fire({
          icon: "error",
          title: "Room not found!",
        });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
      Toast.fire({
        icon: "error",
        title: "Error leaving room: " + error.message,
      });
    }
  };

  return (
    <div className="myrooms">
      <h2>My Rooms</h2>
      <div className="myrooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div className="room-box" key={room.roomId}>
              <Link
                to={`/rooms/${room.roomId}`}
                style={{ display: menu === "flex" ? "flex" : "none" }}
              >
                {room.name}
              </Link>
              <div
                className="room-box-set"
                style={{ display: menu === "flex" ? "none" : "flex" }}
              >
                <button onClick={() => copyToClipboard(room.roomId)}>
                  <IoCopySharp />
                </button>
                {
                  // Only the room creator can delete the room
                  room.by === currentUser.uid ? (
                    <button className="delete" onClick={deleteRoom}>
                      Delete <IoMdTrash />
                    </button>
                  ) : (
                    ""
                  )
                }
                <div className="room-users">
                  {
                    // usres in the room
                    room.users.length
                  }
                  <FaUserFriends />
                </div>
                {
                  // everyone can leave the room except the creator
                  room.by !== currentUser.uid ? (
                    <button className="room-leave" onClick={leaveRoom}>
                      Leave
                      <ImExit />
                    </button>
                  ) : (
                    ""
                  )
                }
                <div className="room-creator">
                  <p>By</p>
                  <span>
                    {
                      // room creator
                      room.by === currentUser.uid ? "You" : room.creatorName
                    }
                  </span>
                </div>
              </div>
              <button
                className="menu"
                onClick={() => {
                  setMenu(menu === "none" ? "flex" : "none");
                }}
              >
                <CgMenuGridO />
              </button>
            </div>
          ))
        ) : (
          <NoRoomAvailable />
        )}
      </div>
    </div>
  );
};

export default AvRooms;
