import React, { useEffect, useState } from "react";
import "./styles/home-user.css";
import AvRooms from "./av-rooms";
import { auth, db } from "../../firebase-config"; // Make sure you import db
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

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
    return <div>Loading...</div>; // You can replace this with a loading spinner if desired
  }

  return (
    <div className="home-user">
      {!isUserInFirestore ? (
        <div className="setup-profile-message">
          <h2>Please finish setting up your profile. <Link to={"/settings"}>HERE</Link> </h2>
        </div>
      ) : (
        <AvRooms />
      )}
    </div>
  );
};

export default HomeUser;
