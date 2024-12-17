import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../components/AuthContext";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils";
import { Contacts } from "../components/Contacts";
import { Welcome } from "../components/Welcome";
import { ChatContainer } from "../components/ChatContainer";
import { io } from "socket.io-client";
import { ChatGroupContainer } from "../components/ChatGroupContainer";

export const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const navigate = useNavigate();
  const socket = useRef();

  useEffect(() => {
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(localStorage.getItem("chat-app-user")));
      setIsLoading(true);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(`${process.env.REACT_APP_API_URL}`);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        if (currentUser.avatarImage) {
          try {
            const data = await axiosInstance.get("api/v1/user/friends");
            if (data.status === 200) {
              setContacts(data.data.data);
            } else {
              navigate("/set-avatar");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      }
    };

    fetchUser();
  }, [currentUser]);

  const handleSelectContact = (contact) => {
    console.log(contact);
    if (contact.members) {
      setIsGroupChat(true);
    } else {
      setIsGroupChat(false);
    }
    setCurrentChat(contact);
  };

  return (
    <StyledChat>
      <div className="container" style={{ backgroundColor: "#1b1b1f" }}>
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          onSelectContact={handleSelectContact}
        />
        {isLoading && currentChat === undefined ? (
          <Welcome user={currentUser} />
        ) : isGroupChat ? (
          <ChatGroupContainer
            currentUser={currentUser}
            socket={socket.current}
          />
        ) : (
          <ChatContainer
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket.current}
          />
        )}
      </div>
    </StyledChat>
  );
};

const StyledChat = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: #131324;
  overflow: hidden;
  padding: 5rem;

  .container {
    height: 100%;
    width: 100%;
    background-color: #1b1b1f;
    display: flex;
  }
`;
