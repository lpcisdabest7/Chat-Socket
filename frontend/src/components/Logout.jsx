import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BiPowerOff } from "react-icons/bi";

export const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login");
  };
  return (
    <StyledButton>
      <BiPowerOff onClick={handleLogout} />
    </StyledButton>
  );
};

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.5rem;
  border: none;
  outline: none;
  background-color: #9a86f3;
  svg {
    font-size: 1.5rem;
    color: #ebe7ff;
  }
`;
