import React, { useEffect } from "react";
import styled from "styled-components";
import { ChatGroupHeader } from "./ChatGroupHeader";
import { ChatGroupMessageContent } from "./ChatGroupMessageContent";
import { ChatInput } from "./ChatInput";

export const ChatGroupContainer = ({ currentUser, socket, currentGroup }) => {
  const handleSendChat = async (message) => {
    if (socket) {
      socket.emit("sendGroupMessage", {
        userId: currentUser._id,
        content: message,
        roomId: currentGroup._id,
      });
    }
  };
 useEffect(() => {
  if (socket && currentGroup) {
    console.log("Joining room:", currentGroup._id);

    socket.emit("joinRoom", {
      roomId: currentGroup._id,
      userId: currentUser._id,
    });

    socket.on("userJoined", (data) => {
      console.log("User joined room:", data);
    });

    return () => {
      console.log("Leaving room:", currentGroup._id);
      socket.emit("leaveRoom", { roomId: currentGroup._id }); // Nếu có logic leave room ở backend
      socket.off("userJoined");
    };
  }
}, [socket, currentGroup]);

return (
  <StyledChatGroupContainer>
    <ChatGroupHeader currentGroup={currentGroup} />
    <ChatGroupMessageContent
      currentGroup={currentGroup}
      currentUser={currentUser}
      socket={socket}
    />
    <ChatInput handleSendChat={handleSendChat} />
  </StyledChatGroupContainer>
);
};

const StyledChatGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #0a0a15;
  width: 100%;
`;
