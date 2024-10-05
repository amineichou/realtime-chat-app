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
    }
  );
};

const AvRooms = ({ inRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // State to track the active menu
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

  const deleteRoom = async (roomId) => {
    try {
      const roomQuery = query(roomsColl, where("roomId", "==", roomId));
      const querySnapshot = await getDocs(roomQuery);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const roomDoc = doc(db, "rooms", docSnapshot.id);
          await deleteDoc(roomDoc);
          Toast.fire({
            icon: "success",
            title: "Room deleted successfully!",
          });
        });
      } else {
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
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      const roomQuery = query(roomsColl, where("roomId", "==", roomId));
      const querySnapshot = await getDocs(roomQuery);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const roomDoc = doc(db, "rooms", docSnapshot.id);
          const roomData = docSnapshot.data();
          const roomUsers = roomData.users;
          const roomUsersNames = roomData.usersNames;
          const currentUserIndex = roomUsers.indexOf(currentUser.uid);

          if (currentUserIndex !== -1) {
            roomUsers.splice(currentUserIndex, 1);
            roomUsersNames.splice(currentUserIndex, 1);

            await setDoc(roomDoc, {
              ...roomData,
              users: roomUsers,
              usersNames: roomUsersNames,
            });
            Toast.fire({
              icon: "success",
              title: "Left room successfully!",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: "User not found in the room!",
            });
          }
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Room not found!",
        });
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error leaving room: " + error.message,
      });
    }
  };

  return (
    <div className={`myrooms ${inRoom && "in-room"}`}>
      <h2>My Rooms</h2>
      <div className="myrooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div className="room-box" key={room.roomId}>
              <Link
                to={`/rooms/${room.roomId}`}
                style={{
                  display: activeMenu === room.roomId ? "none" : "flex",
                }}
              >
                {room.name}
              </Link>
              <div
                className="room-box-set"
                style={{
                  display: activeMenu === room.roomId ? "flex" : "none",
                }}
              >
                <button onClick={() => copyToClipboard(room.roomId)}>
                  <IoCopySharp />
                </button>
                {room.by === currentUser.uid && (
                  <button
                    className="delete"
                    onClick={() => deleteRoom(room.roomId)}
                  >
                    Delete <IoMdTrash />
                  </button>
                )}
                {room.by !== currentUser.uid && (
                  <button
                    className="room-leave"
                    onClick={() => leaveRoom(room.roomId)}
                  >
                    Leave <ImExit />
                  </button>
                )}
                <div className="room-users">
                  {room.users.length}
                  <FaUserFriends />
                </div>
              </div>
              <button
                className="menu"
                onClick={() => {
                  setActiveMenu(
                    activeMenu === room.roomId ? null : room.roomId
                  );
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
