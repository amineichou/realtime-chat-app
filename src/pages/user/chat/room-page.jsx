import React from "react";
import { useParams } from "react-router-dom";
import Room from "./room";
import AvRooms from "../av-rooms";
import AvUsers from "../av-users";
import "./styles/room-page.css";

const RoomPage = () => {
  const { roomId } = useParams();
  return (
    <div className="room-page">
      <div className="room-av">
        <AvRooms inRoom={true}/>
      </div>
      <Room roomId={roomId} />
    </div>
  );
};

export default RoomPage;
