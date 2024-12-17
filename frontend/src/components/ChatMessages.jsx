import React from "react";
import styled from "styled-components";

export const ChatMessages = ({ messages, currentUser }) => {
  const sortedMessages = messages.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <StyledChatMessages>
      {sortedMessages.length > 0 &&
        sortedMessages.map((message, index) => {
          return (
            <div
              key={index}
              className={`message ${
                currentUser._id === message.receiverId ? "receiver" : "sender"
              }`}
            >
              <div className="message-content">
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
    </StyledChatMessages>
  );
};

const StyledChatMessages = styled.div`
  height: 80%;
  padding: 0.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
  .message {
    display: flex;
    align-items: center;
    .message-content {
      max-width: 40%;
      overflow-wrap: break-word;
      padding: 1rem;
      border-radius: 1rem;
      color: #d1d1d1;
      p {
        font-size: 1rem;
        font-weight: 500;
        color: #fff;
      }
    }
  }

  .sender {
    justify-content: flex-end;

    .message-content {
      background-color: #4f04ff21;
    }
  }

  .receiver {
    justify-content: flex-start;

    .message-content {
      background-color: #9900ff21;
    }
  }
`;
