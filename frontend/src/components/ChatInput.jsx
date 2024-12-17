import React, { useState } from "react";
import styled from "styled-components";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";

export const ChatInput = ({ handleSendChat }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [message, setMessage] = useState("");

  const handleShowEmoji = () => {
    setShowEmoji(() => !showEmoji);
  };

  const handleSelectedEmoji = (emoji, e) => {
    let msg = message;
    msg += emoji?.emoji;

    setMessage(msg);
  };

  const handSendMessage = (e) => {
    e.preventDefault();
    if (message.length > 0) {
      handleSendChat(message);
      setMessage("");
    }
  };

  return (
    <StyledChatInput>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleShowEmoji} />

          {showEmoji && (
            <EmojiPicker
              onEmojiClick={handleSelectedEmoji}
              className="emoji-picker-react"
            />
          )}
        </div>
      </div>

      <form className="input-container" onSubmit={(e) => handSendMessage(e)}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">
          <IoSend />
        </button>
      </form>
    </StyledChatInput>
  );
};

const StyledChatInput = styled.div`
  display: grid;
  grid-template-columns: 1% 99%;
  align-items: center;
  background: #1a1a30;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  .button-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fff;

    .emoji {
      position: relative;

      svg {
        font-size: 1.5rem;
        color: #ffff00c7;
        cursor: pointer;
      }

      .emoji-picker-react {
        position: absolute;
        top: -460px;
      }
    }
  }

  .input-container {
    width: 99%;
    background-color: #5d5555;
    border-radius: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;

    input {
      width: 100%;
      border: none;
      outline: none;
      background-color: transparent;
      color: #fff;
      padding: 0.5rem;
      font-size: 1rem;
      font-weight: 400;
      padding-left: 1rem;

      &::selection {
        background-color: #9186f3;
      }
    }

    button {
      padding: 0.5rem 2rem;
      border-radius: 2rem;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #9186f3;
      cursor: pointer;

      svg {
        font-size: 1.2rem;
        color: #fff;
        cursor: pointer;
      }
    }
  }
`;
