import React from "react";
import "./styles/user-profile.css";
import { useParams } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { TiUserAdd, TiUserDelete } from "react-icons/ti";
import { AiFillMessage } from "react-icons/ai";

const UserProfile = () => {
  const { userId } = useParams();

  console.log(userId);
  return (
    <div className="user-profile">
      <img src="/images/profile-f.jpeg" alt={userId} />
      <h1>John Doe</h1>
      <h2>@{userId}</h2>
      <p>Joined: 2021</p>
      <div className="add-profile">
        <button className="edit">
          Edit Profile
          <MdEdit />
        </button>
        <button className="add">
          Add friend
          <TiUserAdd />
        </button>
        <button className="remove">
          Remove friend
          <TiUserDelete />
        </button>
        <button className="message">
          Message
          <AiFillMessage />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
