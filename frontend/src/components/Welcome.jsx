import React from "react";
import styled from "styled-components";
import robot from "../assets/robot.gif";

export const Welcome = ({ user }) => {
  return (
    <StyledWelcome>
      <div className="logo-chat">
        <img src={robot} alt="robot" />
      </div>

      <div className="welcome-content">
        <h1>
          Welcome to TC-Chat Chat App, <span>{user?.username}</span>!
        </h1>
        <p>Please select a chat to Start Messaging</p>
      </div>
    </StyledWelcome>
  );
};

const StyledWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  background-color: rgb(71, 84, 104);

  .logo-chat {
    width: 400px;
    height: 400px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .welcome-content {
    color: #fff;
    text-align: center;

    span {
      color: #6e6795;
    }
  }
`;
