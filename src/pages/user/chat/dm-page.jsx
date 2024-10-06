import React from "react";
import { useParams } from "react-router-dom";
import "./styles/room-page.css";
import Dm from "./dm";
import AvDms from "../av-dms";

const DmPage = () => {
  const { dmId } = useParams();

  return (
    <div className="room-page">
      <div className="room-av">
        <AvDms inRoom={true} urlDmId={dmId}/>
      </div>
      <Dm dmId={dmId} />
    </div>
  );
};

export default DmPage;
