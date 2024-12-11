import React from "react";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export const PrivateRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
