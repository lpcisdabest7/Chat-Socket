import React from "react";
import styled from "styled-components";
import { Logout } from "./Logout";

export const ChatGroupHeader = ({ avatarImage, currentGroup }) => {
  return (
    <StyledChatHeader>
      <div className="group-details">
        <div className="avatar">
          <img src={getAvatarSource(avatarImage)} alt="avatar" />
        </div>
        <div className="group-name">
          <h4>{currentGroup.groupName}</h4>
        </div>
      </div>
      <div className="actions">
        <button className="settings-button">Settings</button>
        <Logout />
      </div>
    </StyledChatHeader>
  );
};

// Helper function to get the avatar image
const getAvatarSource = (avatarImage) => {
  return avatarImage
    ? avatarImage
    : "https://raw.githubusercontent.com/lpcisdabest7/Chat-Socket/d00f3b28a57809871969d786d1a245582d1a63de/backend/src/image-logo/logo.jpeg"; // Fallback to default avatar
};

// Styled components for the header and its elements
const StyledChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #5252b4;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  .group-details {
    display: flex;
    align-items: center;

    .avatar {
      width: 40px;
      height: 40px;
      margin-right: 10px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .group-name {
      h4 {
        color: white;
        font-size: 16px;
        margin: 0;
      }
    }
  }

  .actions {
    display: flex;
    gap: 10px;

    .settings-button,
    .logout-button {
      background-color: #333;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background-color: #555;
      }
    }
  }
`;
