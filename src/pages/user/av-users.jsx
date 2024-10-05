import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase-config"; // Adjust the path to your firebase config
import "./styles/av-users.css"; // Optional: Add styling for users
import { Link } from "react-router-dom";

const AvUsers = () => {
  const [users, setUsers] = useState([]); // State to store users
  const [loading, setLoading] = useState(true); // State to show loading indicator
  const [searchTerm, setSearchTerm] = useState(""); // State to store search term

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users"); // Reference to users collection
        const usersSnapshot = await getDocs(usersCollection); // Get all documents
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); // Convert snapshot to array of user objects
        setUsers(usersList); // Set users in state
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users
    .filter((user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 6); // Limit the displayed users to a maximum of 6

  return (
    <div className="av-users-container">
      <h2>Available Users</h2>
      <div className="search-users">
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
        />
      </div>
      <div className="users">
        {filteredUsers.map(
          (user) =>
            // Display user details but not the current user
            user.id !== auth.currentUser.uid && (
              <Link
                to={`/users/${user.username}`}
                key={user.id}
                className="user-card"
              >
                {user.image && <img src={user.image} alt={user.fullName} />}{" "}
                <p>{user.username || "N/A"}</p>
              </Link>
            )
        )}
        {filteredUsers.length === 0 && <p>No users available.</p>}
        {loading && <p>Loading users...</p>}
      </div>
    </div>
  );
};

export default AvUsers;
