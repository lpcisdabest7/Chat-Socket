import { useEffect, useState } from "react";
import styled from "styled-components";

export const Contacts = ({ contacts, currentUser, onSelectContact }) => {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserAvatar, setCurrentUserAvatar] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(() => {
    if (currentUser) {
      setCurrentUserName(currentUser.username);
      setCurrentUserAvatar(currentUser.avatarImage);
    }
  }, [currentUser]);

  const changeCurrentUserChat = (index) => {
    setCurrentSelected(index);
    onSelectContact(contacts[index]);
  };

  const getAvatarSource = (avatarImage) => {
    if (avatarImage.startsWith("PHN")) {
      return `data:image/svg+xml;base64,${avatarImage}`;
    }
    return avatarImage;
  };

  return (
    <>
      {currentUserName && currentUserAvatar && (
        <StyledContacts>
          <div className="brand">
            <img
              src="https://static.vecteezy.com/system/resources/previews/014/664/394/non_2x/chat-bot-symbol-and-logo-icon-vector.jpg"
              alt="logo"
            />
            <h3>TC-Chat</h3>
          </div>

          <div className="contacts">
            {contacts.length ? (
              contacts.map((contact, index) => {
                return (
                  <div
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    key={index}
                    onClick={() => changeCurrentUserChat(index)}
                  >
                    <div className="avatar">
                      <img
                        src={getAvatarSource(contact.avatarImage)}
                        alt={contact.username}
                      />
                    </div>
                    <div className="username">
                      <h4>{contact.username}</h4>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "#fff" }}>No contact available</div>
            )}
          </div>

          <div className="current-user">
            <div className="avatar">
              <img
                src={getAvatarSource(currentUserAvatar)}
                alt={currentUser.username}
              />
            </div>
            <div className="username">
              <h3>{currentUser.username}</h3>
            </div>
          </div>
        </StyledContacts>
      )}
    </>
  );
};

const StyledContacts = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #280cc6;
    color: #fff;
    padding: 1rem;

    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 700;
      text-transform: uppercase;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #080420;
    overflow-y: auto;
    flex: 1;

    .contact {
      cursor: pointer;
      background-color: #ffffff39;
      min-height: 5rem;
      width: 90%;
      border-radius: 0.5rem;
      padding: 0.5rem;
      gap: 1rem;
      display: flex;
      align-items: center;

      .avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .username {
        h4 {
          color: #fff;
        }
      }
    }

    .selected {
      background-color: #9186f3;
    }
  }

  .current-user {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0d0d30;
    color: #fff;
    padding: 1rem;
    gap: 1.5rem;

    .avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .username {
      h3 {
        color: #fff;
      }
    }
  }
`;
