import React from "react";
import { useAuth } from "../components/AuthContext";

export const Chat = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <p>You need to be logged in to access this page</p>;
  }
  return (
    <div>
      <h1>Chat</h1>
      <p>This is the chat page</p>

      <div>
        <h2>User Information:</h2>
        {user ? (
          <div>
            <p>Name: {user.name}</p>{" "}
            {/* Adjust based on the actual data returned */}
            <p>Email: {user.email}</p>{" "}
            {/* Adjust based on the actual data returned */}
            <p>Username: {user.username}</p>{" "}
            {/* Adjust based on the actual data returned */}
            {/* Display other user info here */}
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
