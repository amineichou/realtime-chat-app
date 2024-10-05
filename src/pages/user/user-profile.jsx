import React, { useState, useEffect } from "react";
import "./styles/user-profile.css";
import { useNavigate, useParams } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { AiFillMessage } from "react-icons/ai";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { BallTriangle } from "react-loader-spinner";

const UserProfile = () => {
  const { username } = useParams(); // Get the username from the URL
  const [userData, setUserData] = useState(null); // To store user data
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle error state
  const [yearJoined, setYearJoined] = useState(null); // For joined year
  const navigate = useNavigate();

  // Fetch user data from Firestore by username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userQuery = query(
          usersCollection,
          where("username", "==", username)
        ); // Query to find the user by username
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserData(userData);

          // Convert Firestore timestamp to a readable date
          const joinedDate = userData.createdAt?.toDate();
          if (joinedDate) {
            setYearJoined(joinedDate.getFullYear());
          } else {
            setYearJoined("Unknown");
          }
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="loading-page-user-profile">
        <BallTriangle
          visible={true}
          height={100}
          width={100}
          color="#2B9FFF"
          backgroundColor="#e20b0b"
        />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>; // Show error message if any
  }

  return (
    <div className="user-profile">
      <div className="header">
        <img
          src={userData?.image || "/images/profile-f.jpeg"} // Use user's photoURL if available, else default
          alt={userData?.fullName || "Anonymous"}
        />
        <div className="username">
          <p>@{userData?.username || username}</p>
          <h1>{userData?.fullName || "Anonymous"}</h1>
        </div>
      </div>
      {/* {userData?.id === auth.currentUser.uid && (
        <div className="private-info">
          <p>{userData?.email || "Unknown"}</p>
          <p>{userData?.dob || "Unknown"}</p>
        </div>
      )} */}
      <div className="add-profile">
        {
          // only edit profile if the user is the current user
          userData?.id === auth.currentUser.uid ? (
            <button className="edit" onClick={() => navigate("/edit-profile")}>
              Edit Profile
              <MdEdit />
            </button>
          ) : (
            <>
              <button className="message">
                Message
                <AiFillMessage />
              </button>
              <button className="add">
                Add friend
                <TiUserAdd />
              </button>
            </>
          )
        }
      </div>
    </div>
  );
};

export default UserProfile;
