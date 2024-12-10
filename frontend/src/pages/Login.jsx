import React from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";

// Define validation schema with custom error messages
const schema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email address is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await axios.get("/auth/google");
      console.log("Google login response", res.data);
    } catch (error) {
      console.log("Google login error", error);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>login</h2>
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

        <button type="submit">Login</button>

        <p>
          Don't have an account?{" "}
          <Link to="/register" className="link">
            register
          </Link>{" "}
        </p>

        <hr />
        <p>Or signup with</p>
        <button className="button-group" onClick={handleGoogleLogin}>
          <i className="fa-brands fa-google" style={{ color: "#f54242" }}></i>
          <p style={{ color: "#26292b" }}>Login with Google</p>
        </button>
        <button
          className="button-group"
          style={{ backgroundColor: "#4257f5" }}
          onClick={handleGoogleLogin}
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
