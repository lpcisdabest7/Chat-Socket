import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Retrieve token from localStorage when the app starts
  const storedToken = localStorage.getItem("authToken");

  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          axiosInstance
            .get("api/v1/auth/me")
            .then((response) => {
              setUser(response.data.data);
              localStorage.setItem(
                "chat-app-user",
                JSON.stringify(response.data.data)
              );
            })
            .catch((error) => console.error(`Error fetching data:`, error));
        } catch (error) {
          console.error("User fetch error", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken); // Store token in localStorage
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken"); // Remove token from localStorage
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
