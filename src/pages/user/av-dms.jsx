import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import "./styles/av-dms.css";

const AvDms = (params) => {
  const {inRoom, urlDmId} = params;
  const [dms, setDms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDms = async () => {
      if (!auth.currentUser) return;

      try {
        const dmsRef = collection(db, "dms");
        const q = query(
          dmsRef,
          where("users", "array-contains", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);

        const dmsData = await Promise.all(
          snapshot.docs.map(async (dmDoc) => {
            const dmData = { id: dmDoc.id, ...dmDoc.data() };

            // Fetch user info for other participants in the DM
            const otherUsers = await Promise.all(
              dmData.users
                .filter((user) => user !== auth.currentUser.uid)
                .map(async (userId) => {
                  try {
                    const userDocRef = doc(db, "users", userId); // Reference to the user document
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                      return userDoc.data();
                    } else {
                      console.warn("User not found:", userId);
                      return null;
                    }
                  } catch (error) {
                    console.error("Error fetching user data:", error);
                    return null;
                  }
                })
            );

            return { ...dmData, otherUsers };
          })
        );

        setDms(dmsData);
      } catch (err) {
        setError("Failed to fetch DMs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDms();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <BallTriangle visible={true} height={100} width={100} color="#2B9FFF" />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={`av-dms ${inRoom && "in-room"}`}>
      <h2>Direct Messages</h2>
      {dms.length > 0 ? (
        <div className="dm-list">
          {dms.map((dm) =>
            dm.otherUsers.map((user) => (
              <Link
                to={`/dm/${dm.id}`}
                key={user?.uid || user?.username}
                className={`dm-user ${urlDmId === dm.id ? "active" : ""}`}
              >
                <div className="dm-info">
                  <img
                    src={user?.status !== "deleted" ? (user?.image || "/images/profile-f.jpeg") : ""}
                    alt={user?.fullName || "User"}
                    className="dm-user-image"
                  />
                  <p>{user?.status !== "deleted" ? (user?.fullName || "Anonymous") : "Deleted User"}</p>
                </div>
                <div className="dm-time">
                  <p className="date">
                    {dm.createdAt
                      ? dm.createdAt.toDate().toLocaleDateString()
                      : "Date not available"}
                  </p>
                  <p className="username">@{user?.username || "Anonymous"}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="no-dms">
          <p>No DMs available</p>
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/search-not-found-illustration-download-in-svg-png-gif-file-formats--zoom-logo-404-error-empty-pack-design-development-illustrations-6632131.png?f=webp" alt="no dms" />
        </div>
      )}
    </div>
  );
};

export default AvDms;
