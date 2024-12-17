import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../utils";
import { IoMdPersonAdd } from "react-icons/io";
import { IoPersonRemove } from "react-icons/io5";

const getAvatarSource = (avatarImage = "") => {
  if (avatarImage.startsWith("PHN")) {
    return `data:image/svg+xml;base64,${avatarImage}`;
  }
  return avatarImage;
};

export const Contacts = ({
  contacts,
  currentUser,
  onSelectContact,
  onUpdateContacts,
}) => {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserAvatar, setCurrentUserAvatar] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [groupChats, setGroupChats] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentGroupSelected, setCurrentGroupSelected] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setCurrentUserName(currentUser.username);
      setCurrentUserAvatar(currentUser.avatarImage);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchGroupChats = async () => {
      const res = await axiosInstance.get("/api/chat/rooms");
      setGroupChats(res.data.data);
    };

    fetchGroupChats();
  }, []);

  useEffect(() => {
    const fetchGroupUsers = async () => {
      const res = await axiosInstance.get("/api/v1/user");
      const listUsers = res.data.data.listUsers;
      const listIdContacts = contacts.map((contact) => contact._id);
      setGroupUsers(
        listUsers.filter(
          (user) =>
            user?._id !== currentUser?._id &&
            !listIdContacts.includes(user?._id)
        )
      );
    };

    fetchGroupUsers();
  }, [contacts]);

  const changeCurrentUserChat = (index) => {
    setCurrentSelected(index);
    onSelectContact(contacts[index]);
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) return;
    const res = await axiosInstance.post(`api/chat/message/${groupName}`, {
      groupName: groupName,
    });
    setGroupChats([...groupChats, res.data.data]);
    setGroupName("");
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setMessages([]);
    onSelectContact(group);
    setCurrentGroupSelected(group.id);
  };

  const handleAddFriend = async (user) => {
    await axiosInstance.post(`api/v1/user/add/friends`, {
      friendIds: [user._id],
    });
    setGroupUsers((prev) =>
      prev.filter((prevUser) => prevUser._id !== user._id)
    );
    onUpdateContacts(user, "add");
  };

  const handleRemoveFriend = async (user) => {
    const friendId = user._id;
    const res = await axiosInstance.delete(`api/v1/user/${friendId}`, {
      friendId: [user._id],
    });
    console.log(res);
    setGroupUsers((prev) => [...prev, user]);
    onUpdateContacts(user, "remove");
  };

  return (
    <>
      {currentUserName && currentUserAvatar && (
        <StyledContacts>
          <div className="brand">
            <img
              src="https://raw.githubusercontent.com/lpcisdabest7/Chat-Socket/d00f3b28a57809871969d786d1a245582d1a63de/backend/src/image-logo/logo.jpeg"
              alt="logo"
            />
            <h3>TC-Chat</h3>
          </div>

          <div className="contacts">
            <h4 style={{ color: "#fff", textAlign: "left" }}>Friends</h4>

            {contacts.length ? (
              contacts.map((contact, index) => {
                return (
                  <div
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    key={contact._id} // Use _id as the unique key
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
                      <IoPersonRemove
                        onClick={() => handleRemoveFriend(contacts[index])}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "#fff" }}>No contact available</div>
            )}

            <div className="group-chats">
              <h4>Group Chats</h4>
              {groupChats.length > 0 ? (
                groupChats.map((group) => (
                  <div
                    className={`group-chat ${
                      group._id === currentGroupSelected ? "selected" : ""
                    }`}
                    key={group._id} // Use group.id as the unique key
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="group-avatar">
                      <img
                        src={getAvatarSource(
                          group?.users[0]?.avatarImage ||
                            "https://images.unsplash.com/photo-1732480509151-cb3d991ff9a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMHx8fGVufDB8fHx8fA%3D%3D"
                        )}
                        alt={group.groupName}
                      />
                    </div>
                    <div className="group-name">
                      <h4>{group.groupName}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <div>No group chats available</div>
              )}

              <div className="create-group">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter new group name"
                />
                <button onClick={handleCreateGroupChat}>Create Group</button>
              </div>
            </div>

            <div className="group-users">
              <h4>List Users</h4>
              {groupUsers.length ? (
                groupUsers.map((user) => {
                  return (
                    <div className={`user`} key={user._id}>
                      <div className="avatar">
                        <img
                          src={getAvatarSource(user.avatarImage)}
                          alt={user.username}
                        />
                      </div>
                      <div className="username">
                        <h4>{user.username}</h4>
                        <IoMdPersonAdd onClick={() => handleAddFriend(user)} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "#fff" }}>
                  You are friend over users system
                </div>
              )}
            </div>
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

        svg {
          font-size: 1.3rem;
          cursor: pointer;
          color: #fff;

          &:hover {
            color: #9186f3;
          }
        }
      }
    }

    .selected {
      background-color: #9186f3;

      .username {
        svg {
          &:hover {
            color: #0d0d30;
          }
        }
      }
    }

    .group-chats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #fff;

      .selected {
        background-color: #9186f3;
      }

      .group-chat {
        cursor: pointer;
        background-color: #ffffff39;
        min-height: 5rem;
        width: 90%;
        border-radius: 0.5rem;
        padding: 0.5rem;
        gap: 1rem;
        display: flex;
        align-items: center;

        .group-avatar {
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

        .group-name {
          h4 {
            font-size: 1rem;
            font-weight: 400;
            color: #fff;
          }
        }
      }

      .create-group {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: center;

        input {
          padding: 0.5rem;
          border-radius: 0.5rem;
          outline: none;
          border: none;
          background-color: #ffffff39;
          color: #fff;
        }

        button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          outline: none;
          border: none;
          background-color: #9186f3;
          color: #fff;
          cursor: pointer;
        }
      }
    }

    .group-users {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #fff;
      width: 90%;

      .user {
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

          svg {
            font-size: 1.5rem;
            cursor: pointer;

            &:hover {
              color: #9186f3;
            }
          }
        }
      }
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
