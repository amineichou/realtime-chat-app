import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRef } from "react";
import { auth, db } from "../firebase-config";
import Swal from "sweetalert2";
import { Toast } from "../pages/utils";
import "../styles-global/create-join.css";
import { IoClose } from "react-icons/io5";

const AddRoom = (params) => {
  const { displayBox, setDisplayBox } = params;
  const roomInputRef = useRef(null);
  const roomsColl = collection(db, "rooms");

  // Function to handle adding a room to the database
  const addRoomdb = async () => {
    const roomName = roomInputRef.current.value.trim();
    if (roomName === "" || roomName.length > 20) {
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
        usersNames: [auth.currentUser.displayName],
        creatorName: auth.currentUser.displayName,
      });
      Swal.fire({
        title: "Success!",
        text: "Created Room Successfully",
        icon: "success",
      });
      setDisplayBox(false);
    } catch (error) {
      console.error("Error adding room: ", error);
      Toast.fire({
        icon: "error",
        title: "Error creating room. Please try again.",
      });
    }
  };

  return (
    <div
      className="add-room-container"
      style={{ display: displayBox ? "flex" : "none" }}
    >
      <div className="add-room">
        <button
          className="close"
          onClick={() => {
            setDisplayBox(false);
          }}
        >
          <IoClose />
        </button>
        <h2>Create Room</h2>
        <input
          type="text"
          placeholder="Room Name"
          maxLength="20"
          ref={roomInputRef}
        />
        <button onClick={addRoomdb}>Create Room</button>
      </div>
    </div>
  );
};

export default AddRoom;
