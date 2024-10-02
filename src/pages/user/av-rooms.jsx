import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import "./styles/av-rooms.css";
import { IoCopySharp } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";

const copyToClipboard = (toCopy) => {
  // copy to clipboard roomId
  navigator.clipboard.writeText(toCopy).then(
    function () {
      console.log("Copied to clipboard successfully!");
    },
    function (err) {
      console.error("Error copying to clipboard: ", err);
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = toCopy;
      document.body.appendChild(tempTextArea);
      try {
        document.execCommand("copy");
        console.log("Text copied to clipboard");
        alert("Text copied to clipboard: " + tempTextArea.value);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  );
};

const AvRooms = () => {
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
        console.error("Error fetching rooms: ", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const deleteRoom = async () => {
    // Delete the room
    const roomId = rooms[0].roomId;
    const roomDoc = await db.collection("rooms").doc(roomId).get();
    if (roomDoc.exists) {
      await db.collection("rooms").doc(roomId).delete();
      console.log("Room deleted successfully!");
    } else {
      console.error("Room not found!");
    }
  };

  return (
    <div className="myrooms">
      <h2>My Rooms</h2>
      <div className="myrooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div className="room-box" key={room.roomId}>
              <Link to={`/rooms/${room.roomId}`}>{room.name}</Link>
              <div className="room-box-set">
                <button onClick={() => copyToClipboard(room.roomId)}>
                  <IoCopySharp />
                </button>
                {
                  // Only the room creator can delete the room
                  room.by === currentUser.uid ? (
                    <button className="delete" onClick={deleteRoom}>
                      <IoMdTrash />
                    </button>
                  ) : (
                    ""
                  )
                }
              </div>
            </div>
          ))
        ) : (
          <p>No rooms available, you can create one :)</p>
        )}
      </div>
    </div>
  );
};

export default AvRooms;
