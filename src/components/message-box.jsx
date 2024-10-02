import React from "react";
import "../styles/message-box.css";

const MessageBox = (params) => {
  const { who, message, profileImage } = params;
  return (
    <div className="message-cnt">
      {params.who ? (
        ""
      ) : (
        <img
          src={profileImage}
          alt="user"
          className="user-pic"
        />
      )}

      <div
        className="message"
        style={{
          backgroundColor: who
            ? "var(--message-color) "
            : "var(--out-message-color)",
          color: who ? "#fff" : "#000",
          marginLeft: who ? "auto" : "0",
        }}
      >
        <p>{message}</p>
      </div>
    </div>
  );
};

export default MessageBox;
