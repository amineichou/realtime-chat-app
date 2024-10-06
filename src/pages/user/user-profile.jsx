import React, { useState, useEffect } from "react";
import "./styles/user-profile.css";
import { useNavigate, useParams } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { AiFillMessage } from "react-icons/ai";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
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

  // Function to create or fetch an existing DM
  const createDm = async (user1Id, user2Id) => {
    try {
      const dmsRef = collection(db, "dms");
      const dmQuery = query(dmsRef, where("users", "array-contains", user1Id));

      const snapshot = await getDocs(dmQuery);
      let dm = null;

      // Check if a DM already exists between user1Id and user2Id
      snapshot.forEach((doc) => {
        const users = doc.data().users;
        if (users.includes(user2Id)) {
          dm = { id: doc.id, ...doc.data() };
        }
      });

      if (!dm) {
        // No existing DM, so create a new one
        const dmDoc = await addDoc(dmsRef, {
          users: [user1Id, user2Id],
          createdAt: new Date(),
        });
        dm = { id: dmDoc.id };
      }

      // Redirect to the DM page with the DM ID
      navigate(`/dm/${dm.id}`);
    } catch (error) {
      console.error("Error creating DM:", error);
      throw error;
    }
  };

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
              <button
                className="message"
                onClick={() => createDm(auth.currentUser.uid, userData.id)}
              >
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
