import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { PrivateRoutes } from "./components/PrivateRoutes";
import { AuthProvider } from "./components/AuthContext";
import { SetAvatar } from "./pages/SetAvatar";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId="1070394215325-orr2vrk8e0qrl554a39eo2v8i8g4afql.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/set-avatar" element={<SetAvatar />} />
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={<Chat />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
