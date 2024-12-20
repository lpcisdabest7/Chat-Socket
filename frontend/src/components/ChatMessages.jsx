import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const getAvatarSource = (
  avatarImage = "https://plus.unsplash.com/premium_photo-1732757787056-bb8a19f1c855?q=80&w=1954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
) => {
  if (avatarImage.startsWith("PHN")) {
    return `data:image/svg+xml;base64,${avatarImage}`;
  }
  return avatarImage;
};

export const ChatMessages = ({ messages, currentUser }) => {
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
  // Create a ref for the chat container
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever the messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Re-run this effect when the messages array changes

  // Sort messages by createdAt
  const sortedMessages = messages.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <StyledChatMessages>
      {sortedMessages.length > 0 &&
        messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.userId._id === currentUser._id ||
              message.userId === currentUser._id
                ? "sender"
                : "receiver"
            }`}
          >
            {message.userId._id !== currentUser._id &&
              message.userId !== currentUser._id && (
                <div className="receiver-image">
                  <img
                    src={getAvatarSource(message.userId.avatarImage)}
                    alt="Receiver"
                  />
                </div>
              )}

            <div className="message-container">
              <div className="message-content">
                <p>{message.content}</p>

                <div className="timestamp">
                  {formatTimestamp(message.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </StyledChatMessages>
  );
};

const StyledChatMessages = styled.div`
  height: 100%;
  padding: 0.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;

  .message {
    display: flex;

    .message-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;

      .timestamp {
        margin-top: 5px;
        font-size: 0.8rem;
        font-weight: 500;
        align-self: flex-start;
      }
    }

    .message-content {
      min-width: 614px;
      max-width: 50%; /* Added max-width to ensure it doesn't overflow */
      padding: 1rem;
      border-radius: 3px;
      color: #d1d1d1;
      word-wrap: break-word; /* Ensures words break correctly */
      word-break: break-word; /* Additional rule to break words if necessary */

      p {
        font-size: 1rem;
        font-weight: 500;
        color: #fff;
      }

      /* .timestamp {
        margin-top: 5px;
        font-size: 0.8rem;
        color: #bbb;
      } */
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

  .sender {
    justify-content: flex-end;

    .message-content {
      background-color: #4b9cd3;
      color: #120d0d;
    }
  }

  .receiver {
    justify-content: flex-start;

    .message-content {
      background-color: #2f3136;
      color: #a7a1a1;
    }
  }
`;
