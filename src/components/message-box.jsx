import React from "react";
import "../styles-global/message-box.css";
import { Link } from "react-router-dom";

const MessageBox = (params) => {
  const { who, message, profileImage, userName, time } = params;

  // Format the Firebase timestamp to a human-readable format
  const formattedTime = new Date(time?.toDate()).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <div className="message-cnt">
      {!who && (
        <Link to={`/users/${userName}`}>
          {<img src={profileImage} alt="user" className="user-pic" />}
        </Link>
      )}
      <div
        className="message"
        style={{
          backgroundColor: who
            ? "var(--message-color)"
            : "var(--out-message-color)",
          color: who ? "#fff" : "#000",
          marginLeft: who ? "auto" : "0",
        }}
      >
        <div
          className="message-info"
          style={{
            color: who ? "#e4e4e4" : "#636363",
          }}
        >
          {who ? (
            ""
          ) : (
            <Link to={userName ? `/users/${userName}` : "#"} className="user-name">
              {userName ? "@" + userName : "unknown"}
            </Link>
          )}
          <p className="message-time">{formattedTime}</p>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default MessageBox;
