import React, { useEffect, useState } from "react";
import "../styles-global/home.css";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import MessageBox from "../components/message-box";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { Link } from "react-router-dom";

const Home = () => {
  const text = "Welcome to CloudHangouts!".split(" ");
  const [userCount, setUserCount] = useState(0);

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  const getUsersLength = async () => {
    try {
      // Reference to the 'taken' document inside the 'usernames' collection
      const docRef = doc(db, "usernames", "taken");
      const docSnapshot = await getDoc(docRef);

      // Check if the document exists
      if (docSnapshot.exists()) {
        // Get the array of usernames
        const data = docSnapshot.data();
        const usernamesArray = data.taken || []; // Default to an empty array if 'taken' is undefined

        // Return the length of the array
        return usernamesArray.length;
      } else {
        console.error("Document not found!");
        return 0; // Return 0 if the document doesn't exist
      }
    } catch (error) {
      console.error("Error getting users count:", error);
      return 0; // Return 0 in case of an error
    }
  };

  useEffect(() => {
    const fetchUserCount = async () => {
      const usersLength = await getUsersLength();
      setUserCount(usersLength);

      // Trigger the animation after fetching the user count
      animate(count, usersLength, {
        duration: 2,
      });
    };

    fetchUserCount();
  }, [count]);

  // Messages array with time added
  const messages = [
    {
      who: false,
      message: "Hey, how are you?",
      userName: "user1",
      profileImage: "/images/default/0.jpeg",
    },
    {
      who: true,
      message: "Good, u?",
    },
  ];

  return (
    <div className="home-page">
      <p style={{ display: "none" }}>{userCount}</p>
      <div className="wlc">
        {text.map((el, i) => (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.25,
              delay: i / 6,
            }}
            key={i}
          >
            {el}{" "}
          </motion.span>
        ))}
      </div>
      <div className="example">
        {messages.map((el, i) => (
          <MessageBox
            key={i}
            who={el.who}
            message={el.message}
            userName={el.userName}
            profileImage={el.profileImage}
          />
        ))}
      </div>
      <div className="continue">
        <h2>Login or Register to continue</h2>
        <div className="links">
          <Link to={"/login"} className="login-btn">
            Login
          </Link>
          <Link to={"/register"} className="register-btn">
            Register
          </Link>
        </div>
      </div>
      <div className="about">
        <div>
          <motion.h1>{rounded}</motion.h1>
          <h2>USERS</h2>
        </div>
        <div>
          <motion.h1>{"+1K"}</motion.h1>
          <h2>ROOMS</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;
