import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../utils";

// Assuming you pass currentUser and currentGroup props, and the message object structure is as described
export const ChatGroupMessageContent = ({
  currentUser,
  currentGroup,
  socket,
}) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axiosInstance.get(
        `api/chat/messages/${currentGroup._id}`
      );

      console.log(res.data.data.results); // To log the fetched messages and inspect them
      const sortedMessages = res.data.data.results.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
    };

    fetchMessages();
  }, [currentGroup]);

  useEffect(() => {
    // Set up the event listener
    const handlePrivateMessage = (data) => {
      console.log("Received group message");
      if (data.roomId === currentGroup._id) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    socket.on("groupMessage", handlePrivateMessage);

    // Cleanup on unmount or when socket or roomID changes
    return () => {
      socket.off("groupMessage", handlePrivateMessage);
    };
  }, [socket, currentGroup]);

  return (
    <StyledChatGroupMessageContent>
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          $isCurrentUser={message.userId.username === currentUser.username}
        >
          <div className="message-content">
            <p>{message.content}</p>
          </div>
          <div className="message-info">
            <span className="sender">{message.userId.username}</span> -{" "}
            <span className="timestamp">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </MessageBubble>
      ))}
    </StyledChatGroupMessageContent>
  );
};

// Styled component for individual message bubbles
const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isCurrentUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;

  .message-content {
    background-color: ${(props) =>
      props.$isCurrentUser ? "#4b9cd3" : "#2f3136"};
    color: ${(props) => (props.$isCurrentUser ? "#fff" : "#ddd")};
    padding: 10px;
    border-radius: 20px;
    max-width: 70%;
    word-wrap: break-word;
  }

  .message-info {
    font-size: 12px;
    color: #aaa;
    margin-top: 5px;
    display: flex;
    align-items: center;

    .sender {
      font-weight: bold;
      color: ${(props) => (props.$isCurrentUser ? "#fff" : "#ddd")};
    }

    .timestamp {
      margin-left: 5px;
      color: #bbb;
    }
  }
`;

const StyledChatGroupMessageContent = styled.div`
  width: 100%;
  overflow-y: auto;
  padding: 10px;
  background-color: #1a1a28;
  border-radius: 8px;
  max-height: 500px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;
