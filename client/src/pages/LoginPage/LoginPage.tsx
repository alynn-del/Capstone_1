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

type FieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ onContinueAsGuest }: LoginPageProps) {
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useUser();
  const navigate = useNavigate();

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!state.email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(state.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!state.password) {
      errors.password = "Please add a password with at least 8 characters.";
    }

    return errors;
  }

  function clearPassword() {
    setState((prev) => ({ ...prev, password: "" }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Reset any prior errors on each attempt.
    setError("");
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      clearPassword(); // wipe password even if only the email was invalid
      return;
    }

    try {
      setLoading(true);
      await userService.login(state);
      refreshUser();
      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Unable to log in. Please check your email and password.");
      clearPassword(); // wipe password on a failed login attempt
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the field-specific error as the user corrects it.
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }

    // Clear the general error once the user starts editing.
    if (error) {
      setError("");
    }
  }

  return (
    <main className="login-page">
      <section className="login-form-container">
        <img src="/Logo.png" className="auth-logo" />
        <h1 className="login-header">Welcome Back!</h1>
        <p className="login-subtitle">Log in to your account to continue</p>

        <form autoComplete="on" onSubmit={handleSubmit} className="login-form" noValidate>
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
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            />
            {fieldErrors.email ? (
              <span id="login-email-error" className="field-error">
                {fieldErrors.email}
              </span>
            ) : null}

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="***********"
              value={state.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="login-input"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            />
            {fieldErrors.password ? (
              <span id="login-password-error" className="field-error">
                {fieldErrors.password}
              </span>
            ) : null}

            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
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