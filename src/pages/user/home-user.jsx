import React, { useEffect, useState } from "react";
import "./styles/home-user.css";
import AvRooms from "./av-rooms";
import { auth, db } from "../../firebase-config"; // Make sure you import db
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import AvUsers from "./av-users";
import AvDms from "./av-dms";
import Weather from "./weather";

const HomeUser = () => {
  const user = auth.currentUser;
  const [isUserInFirestore, setIsUserInFirestore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserInFirestore = async () => {
      if (!user) return;

      // Reference to the user's document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // Check if the user exists
      setIsUserInFirestore(userDoc.exists());
      setLoading(false);
    };

    checkUserInFirestore();
  }, [user]);

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

  return (
    <div className="home-user-cn">
      {!isUserInFirestore ? (
        <div className="setup-profile-message">
          <h2>
            Please finish setting up your profile.{" "}
            <Link to={"/settings"}>HERE</Link>{" "}
          </h2>
        </div>
      ) : (
        <div className="home-usr-all">
          <div className="header">
            <AvDms />
            <Weather />
          </div>
          <div className="home-user">
            <AvUsers />
            <AvRooms />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeUser;
