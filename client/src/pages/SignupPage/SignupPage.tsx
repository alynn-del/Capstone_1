import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import "./SignupPage.css";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import userService from "../../utils/userService";
import { useUser } from "../../contexts/UserContext";

type SignupForm = {
  username: string;
  password: string;
};

export default function SignupPage() {
  const [error, setError] = useState("");
  const [state, setState] = useState<SignupForm>({
    username: "",
    password: "",
  });

  const { refreshUser } = useUser();
  const navigate = useNavigate();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setState((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await userService.signup({
        email: state.username.trim(),
        password: state.password.trim()}
      );
      await refreshUser();
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.";

      setError(message);
    }
  }

  function handleCancel() {
    navigate("/login");
  }

  return (
    <main className="signup-page">
      <section className="signup-container">
        <div className="auth-brand" >
          <span className="brand-mark" aria-hidden="true" />
        </div>
        
            <img
            src="/Logo.png"
            className="auth-logo"
            />
        <h1 className="signup-title">Create an Account</h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className={`signup-field${error ? " has-error" : ""}`}>
            <label className="signup-label" htmlFor="signup-username">
              Username
            </label>

            <input
              id="signup-username"
              name="username"
              type="text"
              placeholder="Username"
              value={state.username}
              onChange={handleChange}
              autoComplete="username"
              required
              className="signup-input"
            />
          </div>

          <div className={`signup-field${error ? " has-error" : ""}`}>
            <label className="signup-label" htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Password"
              value={state.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="signup-input"
            />
          </div>

          {error && (
            <div className="signup-errors" role="alert">
              <ErrorMessage message={error} />
            </div>
          )}

          <button type="submit" className="signup-button">
            Create Account
          </button>

          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      </section>
    </main>
  );
}