import React from "react";
import "../styles/message.css";

const Message = ({ params }) => {
  return (
    <div className="message-cnt">
      {params.who ? (
        ""
      ) : (
        <img
          src="https://avatars.githubusercontent.com/u/94761090?v=4"
          alt="user"
          className="user-pic"
        />
      )}

      <div
        className="message"
        style={{
          backgroundColor: params.who
            ? "var(--message-color) "
            : "var(--out-message-color)",
          color: params.who ? "#fff" : "#000",
          marginLeft: params.who ? "auto" : "0",
        }}
      >
        <p>{params.text}</p>
      </div>
    </div>
  );
};

export default Message;
