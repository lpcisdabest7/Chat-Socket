import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBell } from "react-icons/fa"; // Import the bell icon

const getAvatarSource = (
  avatarImage = "https://plus.unsplash.com/premium_photo-1732757787056-bb8a19f1c855?q=80&w=1954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
) => {
  if (avatarImage.startsWith("PHN")) {
    return `data:image/svg+xml;base64,${avatarImage}`;
  }
  return avatarImage;
};

export const ChatGroupMessageContent = ({
  currentUser,
  currentGroup,
  socket,
}) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const formatTimestamp = (createdAt) => {
    const messageDate = new Date(createdAt);
    const currentDate = new Date();
    const isToday = messageDate.toDateString() === currentDate.toDateString();
    const isYesterday =
      messageDate.getDate() === currentDate.getDate() - 1 &&
      messageDate.getMonth() === currentDate.getMonth() &&
      messageDate.getFullYear() === currentDate.getFullYear();

    const timeString = messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `${timeString} | Today`;
    } else if (isYesterday) {
      return `${timeString} | Yesterday`;
    } else {
      return `${timeString} | ${messageDate.toLocaleDateString()}`;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axiosInstance.get(
        `api/chat/messages/${currentGroup._id}`
      );
      const sortedMessages = res.data.data.results.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages((prevMessages) => {
        return [...sortedMessages];
      });
    };

    fetchMessages();
  }, [currentGroup]);

  useEffect(() => {
    const handleGroupMessage = (data) => {
      if (data.roomId === currentGroup._id) {
        console.log("HIIIIIIII", data);

        // Check if the current user is NOT the sender (i.e., it's the receiver)
        if (data.userId._id !== currentUser._id) {
          // Only show notification for the receiver with a bell icon
          toast(<BellNotification content={data.content} />, {
            position: "top-right",
            autoClose: 5000, // Duration of the toast in ms
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }

        // Update message state with the new message
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    socket.on("groupMessage", handleGroupMessage);

    return () => {
      socket.off("groupMessage", handleGroupMessage);
    };
  }, [socket, currentGroup, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <StyledChatGroupMessageContent>
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          className={
            message.userId === currentUser._id ||
            message.userId._id === currentUser._id
              ? "right"
              : "left"
          }
        >
          <div className="message-info">
            {message.userId !== currentUser._id &&
              message.userId._id !== currentUser._id && (
                <div className="receiver-image">
                  <img
                    src={getAvatarSource(message.userId.avatarImage)}
                    alt="Receiver"
                  />
                </div>
              )}
            <div className="message-container">
              <div className="message-subInfo">
                <div className="message-content">
                  <p>{message.content}</p>
                </div>
              </div>

              <div className="timestamp">
                {formatTimestamp(message.createdAt)}
              </div>
            </div>
          </div>
          <div ref={messagesEndRef}></div>
        </MessageBubble>
      ))}
      <ToastContainer /> {/* This renders the toast container */}
    </StyledChatGroupMessageContent>
  );
};

// Custom Bell Notification Component
const BellNotification = ({ content }) => (
  <BellNotificationWrapper>
    <div className="bell-icon">
      <FaBell size={24} color="#fff" />
    </div>
    <div className="notification-content">{content}</div>
  </BellNotificationWrapper>
);

// Styled Components for Bell Notification
const BellNotificationWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px;
  border-radius: 8px;
  max-width: 300px;
  .bell-icon {
    margin-right: 10px;
    background-color: #007bff;
    border-radius: 50%;
    padding: 5px;
  }
  .notification-content {
    font-size: 14px;
  }
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;

  .message-content {
    min-width: 309px;
    max-width: 50%;
    padding: 1rem;
    border-radius: 3px;
    /* padding: 10px; */
    /* border-radius: 20px; */
    /* max-width: 70%; */
    word-wrap: break-word;
    word-break: break-word; /* Additional rule to break words if necessary */
  }

  .message-info {
    color: #aaa;
    margin-top: 5px;
    display: flex;

    .message-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message-subInfo {
      min-width: 16rem;
      border-radius: 3px;
    }

    .sender {
      font-weight: bold;
    }

    .timestamp {
      margin-left: 5px;
      color: #bbb;
    }

    .receiver-image {
      margin-right: 10px;

      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
  }

  &.right {
    align-items: flex-end;

    .message-content {
      /* background-color: #4b9cd3; */
      color: #fff;
    }

    .message-info {
      .message-subInfo {
        background-color: #4b9cd3;
      }

      .sender {
        color: #fff;
      }
    }
  }

  &.left {
    align-items: flex-start;

    .message-content {
      /* background-color: #2f3136; */
      color: #ddd;
    }

    .message-info {
      .message-subInfo {
        background-color: #2f3136;
      }

      .sender {
        color: #ddd;
      }
    }
  }
`;

const StyledChatGroupMessageContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  background-color: #1a1a28;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;
