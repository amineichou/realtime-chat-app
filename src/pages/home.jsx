import React, { useEffect } from "react";
import "../styles-global/home.css";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import MessageBox from "../components/message-box";
import Login from "./login";
import Register from "./register";

const Home = () => {
  const text = "Try This Crazy Chat App".split(" ");

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    animate(count, 2, {
      duration: 2,
    });
  }, [ count ]);

  const messages = [
    {
      who: false,
      message: "Hey, how are you?",
    }
  ]
  return (
    <div className="home-page">
      <div className="example">
        {
            messages.map((el, i) => (
                <MessageBox key={i} params={el} />
            ))
        }
      </div>
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
      <div className="about">
        <motion.h1>{rounded}</motion.h1> <h2>USERS</h2>
      </div>
    </div>
  );
};

export default Home;
