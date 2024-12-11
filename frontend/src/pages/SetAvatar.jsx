import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Buffer } from "buffer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loader from "../assets/loader.gif";
import { useNavigate } from "react-router-dom";

export const SetAvatar = () => {
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  const navigate = useNavigate();

  const setProfilePicture = async () => {
    if (selectedAvatar === null || selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      toast.success("Profile picture updated!", toastOptions);
      const user = await JSON.parse(localStorage.getItem("chat-app-user"));
      const { data } = await axios.post(
        `http://localhost:3000/api/users/${user._id}`,
        {
          image: avatars[selectedAvatar],
        }
      );

      console.log(data);

      if (data.isSet) {
        user.isSetAvatarImage = true;
        user.avatarImage = data.image;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error updating profile picture", toastOptions);
      }
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      const data = [];
      for (let i = 0; i < 4; i++) {
        try {
          const response = await axios.get(
            `https://api.multiavatar.com/${Math.round(Math.random() * 1000)}`,
            { responseType: "arraybuffer" }
          );
          const base64Image = Buffer.from(response.data, "binary").toString(
            "base64"
          );
          data.push(base64Image);
        } catch (error) {
          console.error("Error fetching avatar:", error);
        }
      }
      setAvatars(data);
      setIsLoading(false);
    };

    fetchAvatars();
  }, []);

  return (
    <div>
      {isLoading ? (
        <Loading>
          <img src={loader} alt="loading" />
        </Loading>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an avatar as your profile picture</h1>
          </div>

          <div className="avatar-container">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${
                  selectedAvatar === index ? "selected" : ""
                }`}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(index)}
                />
              </div>
            ))}
          </div>

          <button className="btn-submit" onClick={setProfilePicture}>
            Set as Profile Picture
          </button>
        </Container>
      )}
      <ToastContainer />
    </div>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  background: #131324;
  height: 100vh;
  width: 100vw;

  .title-container {
    h1 {
      color: #fff;
    }
  }

  .avatar-container {
    display: flex;
    flex-direction: row;
    gap: 2rem;

    .avatar {
      width: 100px;
      height: 100px;
      border: 0.4rem solid transparent;
      padding: 0.2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease-in-out;
      cursor: pointer;
    }
    .selected {
      /* border: 0.4rem solid #49627b; */
      border: 0.4rem solid #16c070;
    }
  }

  .btn-submit {
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    background: #1477c8;
    border: none;
    outline: none;
    color: #fff;
    cursor: pointer;
    text-transform: uppercase;

    &:hover {
      background: #0f5f9b;
    }
  }
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #131324;
  height: 100vh;
  width: 100vw;
`;
