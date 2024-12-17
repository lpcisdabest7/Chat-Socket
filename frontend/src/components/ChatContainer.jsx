import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import axiosInstance from "../utils";
import { Logout } from "./Logout";

const getAvatarSource = (avatarImage) => {
  if (avatarImage.startsWith("PHN")) {
    return `data:image/svg+xml;base64,${avatarImage}`;
  }
  return avatarImage;
};

export const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [roomID, setRoomID] = useState("");

  // Track whether the component has mounted
  const isMounted = useRef(false);

  useEffect(() => {
    // Fetch messages on currentChat or roomID change
    const fetchMessages = async () => {
      if (!currentChat || !currentUser) return;

      try {
        const res = await axiosInstance.post(
          `/api/chat/messages/${currentUser._id}/${currentChat._id}`,
          {
            senderId: currentUser._id,
            receiverId: currentChat._id,
          }
        );

        if (res.data.data._id) {
          setRoomID(res.data.data._id); // Set roomID after fetching messages
        }

        const response = await axiosInstance.get(
          `/api/chat/messages/${res.data.data._id}`
        );
        setMessages(response.data.data.results);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
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

  // Set up socket listener for real-time messages
  useEffect(() => {
    if (socket && currentChat && isMounted.current) {
      socket.emit("joinRoom", {
        roomId: roomID,
        userId: currentUser._id,
      });

      socket.on("privateMessage", (data) => {
        // Check if new message is for the current room
        if (data.roomId === roomID) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      });

      // Cleanup the listener when the component unmounts or currentChat changes
      return () => {
        socket.off("privateMessage");
      };
    }

    // Set isMounted flag to true after the first render
    if (!isMounted.current) {
      isMounted.current = true;
    }
  }, [socket, currentChat, roomID]); // Only run when `socket` or `currentChat` changes

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
  background: #0a0a15;
  width: 100%;
  /* padding: 0.5rem 0.5rem; */

  .chat-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem;

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
