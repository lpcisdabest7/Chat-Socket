import React, { useEffect } from "react";
import styled from "styled-components";
import { ChatGroupHeader } from "./ChatGroupHeader";
import { ChatGroupMessageContent } from "./ChatGroupMessageContent";
import { ChatInput } from "./ChatInput";

export const ChatGroupContainer = ({ currentUser, socket, currentGroup }) => {
  const handleSendChat = async (message) => {
    console.log(message);
    if (socket) {
      socket.emit("sendGroupMessage", {
        userId: currentUser._id,
        content: message,
        roomId: currentGroup._id,
      });
    }
  };

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
