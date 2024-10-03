import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase-config";
import "../styles-global/notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state to improve UX

  // Fetch notifications from Firestore
  useEffect(() => {
    const notificationsColl = collection(db, "notifications");

    // Query to order notifications by creation time
    const notificationsQuery = query(
      notificationsColl,
      orderBy("createdAt", "desc")
    );

    // Real-time listener for notifications collection
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(fetchedNotifications); // Update notifications
      setLoading(false); // Stop loading once data is fetched
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, []);

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    const user = auth.currentUser;

    if (!user) {
      console.warn("User not authenticated.");
      return; // Exit if no user is logged in
    }

    const userId = user.uid;
    const notificationDoc = doc(db, "notifications", notificationId);

    try {
      // Check if `readBy` exists before updating
      await updateDoc(notificationDoc, {
        readBy: arrayUnion(userId), // Add userId to readBy array
      });
    } catch (error) {
      console.error("Error marking notification as read: ", error);
    }
  };

  // Handle notification click to mark as read
  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  // Format time to exclude seconds
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notifications-container">
      {loading ? (
        <p>Loading notifications...</p> // Better loading state
      ) : notifications.length > 0 ? (
        notifications.map((notification) => {
          const createdAt = notification.createdAt
            ? formatTime(notification.createdAt.seconds)
            : "Unknown time"; // Fallback for missing timestamp

          return (
            <div
              key={notification.id}
              style={{
                backgroundColor: notification.readBy?.includes(
                  auth.currentUser?.uid
                )
                  ? "#fff"
                  : "#f0f0f0", // Different background for read/unread
              }}
              className="notification"
              onClick={() => handleNotificationClick(notification.id)} // Mark notification as read on click
            >
              <p className="notification-message">
                {notification.message || "No message"} {/* Fallback for missing message */}
              </p>
              <p className="notification-time">{createdAt}</p>
            </div>
          );
        })
      ) : (
        <p>No notifications yet.</p>
      )}
    </div>
  );
};

export default Notifications;
