import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Logout } from "./Logout";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import axiosInstance from "../utils";

const getAvatarSource = (avatarImage) => {
  if (avatarImage.startsWith("PHN")) {
    return `data:image/svg+xml;base64,${avatarImage}`;
  }
  return avatarImage;
};

export const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [roomID, setRoomID] = useState("");
  console.log("CURRENT CHAT", currentChat);
  console.log("CURRENT USER", currentUser);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axiosInstance.post(
        `/api/chat/messages/${currentUser._id}/${currentChat._id}`,
        {
          senderId: currentUser._id,
          receiverId: currentChat._id,
        }
      );

      console.log(res);
      if (res.data.data._id) {
        setRoomID(res.data.data._id);
      }
      const response = await axiosInstance.get(
        `/api/chat/messages/${res.data.data._id}`
      );
      console.log(response);
      setMessages(response.data.data.results);
    };

    fetchMessages();
  }, [currentChat, roomID]);

  const handleSendChat = async (message) => {
    console.log(message, "SENDING MESSAGE");

    socket.current.emit("sendPrivateMessage", {
      senderId: currentUser._id,
      receiverId: currentChat._id,
      content: message,
      roomId: roomID,
    });

    const newMessage = {
      senderId: currentUser._id,
      receiverId: currentChat._id,
      content: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: true,
      roomId: roomID,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("privateMessage", (data) => {
        console.log("New message received via socket:", data);

        setMessages((prevMessages) => {
          // Kiểm tra dữ liệu trước khi cập nhật
          return [...prevMessages, data]; // Thêm tin nhắn mới vào cuối danh sách
        });
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off("privateMessage");
      }
    };
  }, [currentChat]);

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
            <Logout></Logout>
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
