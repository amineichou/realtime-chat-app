import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  getDocs, // Import getDocs for querying documents
  where, // Import where to filter documents
} from "firebase/firestore";
import { db, auth } from "../firebase-config";
import "../styles-global/notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Firestore
  useEffect(() => {
    const notificationsColl = collection(db, "notifications");
    const notificationsQuery = query(notificationsColl, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(fetchedNotifications);
      setLoading(false); // Stop loading once data is fetched
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    const user = auth.currentUser;

    if (!user) {
      console.warn("User not authenticated.");
      return; // Exit if no user is logged in
    }

    const userId = user.uid; // Get the current user's ID

    try {
      // Query to find the document with the specified notificationId
      const notificationsColl = collection(db, "notifications");
      const q = query(notificationsColl, where("id", "==", notificationId)); // Search by 'id'

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // If document exists, update it
        const notificationDoc = doc(db, "notifications", querySnapshot.docs[0].id);

        await updateDoc(notificationDoc, {
          readBy: arrayUnion(userId), // Add userId to readBy array
        });
      } else {
        console.warn("No notification found with the provided ID.");
      }
    } catch (error) {
      console.error("Error marking notification as read: ", error);
    }
  };

  // Handle notification click to mark as read
  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId); // Call markAsRead with the notification's ID
  };

  // Format time to exclude seconds
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time"; // Fallback for missing timestamp

    return new Date(timestamp.seconds * 1000).toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render loading state or notifications
  const renderNotifications = () => {
    if (loading) {
      return <p>Loading notifications...</p>;
    }

    if (notifications.length === 0) {
      return <p>No notifications yet.</p>;
    }

    return notifications.map((notification) => {
      const createdAt = formatTime(notification.createdAt);

      return (
        <div
          key={notification.id} // Unique key for each notification
          style={{
            backgroundColor: notification.readBy?.includes(auth.currentUser?.uid)
              ? "#fff" // White for read notifications
              : "#f0f0f0", // Light gray for unread notifications
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
    });
  };

  return (
    <div className="notifications-container">
      {renderNotifications()}
    </div>
  );
};

export default Notifications;
