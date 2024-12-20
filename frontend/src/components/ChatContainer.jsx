import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import axiosInstance from "../utils";
import { Logout } from "./Logout";

const getAvatarSource = (avatarImage = "") => {
  if (avatarImage.startsWith("PHN")) {
    return `data:image/svg+xml;base64,${avatarImage}`;
  }
  return avatarImage;
};

export const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [roomID, setRoomID] = useState("");

  useEffect(() => {
    const fetchMessages = () => {
      if (!currentChat || !currentChat._id) return;
      socket.on("userJoined", async (data) => {
        try {
          const response = await axiosInstance.get(
            `/api/chat/messages/${data.roomId}`
          );
          setRoomID(data.roomId);
          setMessages(response.data.data.results);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      });
    };

    fetchMessages();
  }, [currentChat, currentUser]);

  // Handle sending a message via socket and update local state
  const handleSendChat = async (message) => {
    if (socket) {
      socket.emit("sendPrivateMessage", {
        senderId: currentUser._id,
        receiverId: currentChat._id,
        content: message,
        roomId: roomID,
      });
    }
  };

  useEffect(() => {
    // Set up the event listener
    const handlePrivateMessage = (data) => {
      console.log("Received private message");
      if (data.roomId === roomID) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    socket.on("privateMessage", handlePrivateMessage);

    // Cleanup on unmount or when socket or roomID changes
    return () => {
      socket.off("privateMessage", handlePrivateMessage);
    };
  }, [socket, roomID]); // Now it will react to changes in socket or roomID

  return (
    <div className="chat-container" style={{ display: "flex", width: "100%" }}>
      {currentChat && (
        <StyledChat>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={getAvatarSource(currentChat.avatarImage)}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h4>{currentChat.username}</h4>
              </div>
            </div>
            <Logout />
          </div>
          <ChatMessages
            messages={messages}
            currentUser={currentUser}
          ></ChatMessages>
          <ChatInput handleSendChat={handleSendChat}></ChatInput>
        </StyledChat>
      )}
    </div>
  );
};

const StyledChat = styled.div`
  display: flex;
  flex-direction: column;
  background: #1a1a28;
  width: 100%;
  /* padding: 0.5rem 0.5rem; */

  .chat-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem;
    background-color: #2e2e45;

    .user-details {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: center;

      .avatar {
        height: 3rem;
        width: 3rem;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      }

      .username {
        h4 {
          font-size: 1.3rem;
          font-weight: 500;
          color: #918181;
        }
      }
    }
  }
`;
