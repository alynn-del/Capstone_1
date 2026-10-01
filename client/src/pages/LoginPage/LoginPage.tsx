import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./LoginPage.css";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import userService from "../../utils/userService";
import { useUser } from "../../contexts/UserContext";

type LoginPageProps = {
  onContinueAsGuest: () => void;
};

export default function LoginPage({ onContinueAsGuest }: LoginPageProps) {
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const { refreshUser } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      await userService.login(state);
      refreshUser();
      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Unable to log in. Please check your email and password.");
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <main className="login-page">
      <section className="login-form-container">
        <img
  src="/Logo.png"
  className="auth-logo"
/>
        <h1 className="login-header">Welcome Back!</h1>
        <p className="login-subtitle">Log in to your account to continue</p>

        <form autoComplete="on" onSubmit={handleSubmit} className="login-form">
          <div className="login-segment">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Email"
              value={state.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="login-input"
            />

            <div className="password-label-row">
              <label htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Password"
              value={state.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <Link to="/signup" className="create-account-btn">
            Create an Account
          </Link>

          <button
            type="button"
            className="explore-link"
            onClick={onContinueAsGuest}
          >
            Explore Recipes without Logging In
          </button>

          {error ? (
            <div className="auth-error">
              <ErrorMessage message={error} />
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}