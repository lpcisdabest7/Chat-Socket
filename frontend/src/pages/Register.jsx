import React from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import axiosInstance from "../utils";
// Define validation schema with custom error messages
const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email address is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post("api/v1/auth/register", data);
      if (res.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Register error", error);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const res = await axiosInstance.post("api/v1/auth/google/login", {
        idToken: response.credential,
      });

      console.log("Google login response", res.data.data);
      const token = res.data.data.tokens.accessToken;
      if (token) {
        login(token);
        navigate("/");
      } else {
        console.error("No token received from the server");
      }
    } catch (error) {
      console.error("Google login error", error);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>signup</h2>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            placeholder="First Name"
            {...register("firstName")}
          />
          <Error>{errors.firstName?.message}</Error>
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            placeholder="Last Name"
            {...register("lastName")}
          />
          <Error>{errors.lastName?.message}</Error>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            placeholder="Email Address"
            {...register("email")}
          />
          <Error>{errors.email?.message}</Error>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          <Error>{errors.password?.message}</Error>
        </div>

        <button type="submit" disabled={!isValid}>
          Register
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login" className="link">
            login
          </Link>{" "}
        </p>

        <hr />
        <p>Or signup with</p>

        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={(error) => console.log("Google login failed", error)}
        >
          <button className="button-group" type="button">
            <i className="fa-brands fa-google" style={{ color: "#f54242" }}></i>
            <p style={{ color: "#26292b" }}>Login with Google</p>
          </button>
        </GoogleLogin>
        <button
          className="button-group"
          style={{ backgroundColor: "#4257f5" }}
          type="button"
        >
          <i className="fa-brands fa-facebook" style={{ color: "#fff" }}></i>
          <p style={{ color: "#fff" }}>Login with Facebook</p>
        </button>
      </form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  background: url(https://www.joshmorony.com/images/backgrounds/goose-blue-bottom.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    width: 50%;

    h2 {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      color: #26292b;
      text-transform: capitalize;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 1rem;
        font-weight: 500;
      }

      input {
        padding: 0.5rem;
        border-radius: 5px;
        border: none;
        outline: none;
        font-size: 1rem;
        font-weight: 400;

        &:focus {
          border: 0.5px solid #429bf5;
          outline: none;
        }
      }

      p {
        text-align: left;
      }
    }

    p {
      font-size: 0.75rem;
      font-weight: 500;
      margin: 0;
      text-align: center;

      .link {
        text-decoration: none;
        color: #f54242;
        text-transform: uppercase;
      }
    }

    button {
      padding: 0.5rem;
      border-radius: 5px;
      border: none;
      outline: none;
      font-size: 1rem;
      font-weight: 500;
      background-color: #429bf5;
      cursor: pointer;
    }

    .button-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.5rem;
      border-radius: 5px;
      border: none;
      outline: none;
      font-size: 1rem;
      font-weight: 500;
      background-color: #fff;
      cursor: pointer;
    }

    .button-group p {
      margin: 0;
      text-align: center;
      flex: 1;
      font-size: 1rem;
      font-weight: 600;
    }

    .button-group i {
      font-size: 1.5rem;
      margin-right: 0.5rem;
    }
  }
`;

const Error = styled.p`
  font-size: 0.75rem;
  color: red;
  margin: 0;
`;
