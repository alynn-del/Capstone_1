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

type FieldErrors = {
  username?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<SignupForm>({
    username: "",
    password: "",
  });

  const { refreshUser } = useUser();
  const navigate = useNavigate();

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    const email = state.username.trim();
    const password = state.password.trim();

    if (!email) {
      errors.username = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.username = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Please add a password with at least 8 characters.";
    }

    return errors;
  }

  function clearPassword() {
    setState((current) => ({ ...current, password: "" }));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setState((current) => ({
      ...current,
      [name]: value,
    }));

    // Clear the field-specific error as the user corrects it.
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }

    // Clear the general (server) error once the user starts editing.
    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      await userService.signup({
        email: state.username.trim(),
        password: state.password.trim(),
      });
      await refreshUser();
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.";

      setError(message);
      clearPassword(); // wipe password on a failed signup attempt
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/login");
  }

  return (
    <main className="signup-page">
      <section className="signup-container">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true" />
        </div>

        <img src="/Logo.png" className="auth-logo" />
        <h1 className="signup-title">Create an Account</h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className={`signup-field${fieldErrors.username ? " has-error" : ""}`}>
            <label className="signup-label" htmlFor="signup-username">
              Username
            </label>

            <input
              id="signup-username"
              name="username"
              type="email"
              placeholder=""
              value={state.username}
              onChange={handleChange}
              autoComplete="email"
              required
              className="signup-input"
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={fieldErrors.username ? "signup-username-error" : undefined}
            />
            {fieldErrors.username ? (
              <span id="signup-username-error" className="field-error">
                {fieldErrors.username}
              </span>
            ) : null}
          </div>

          <div className={`signup-field${fieldErrors.password ? " has-error" : ""}`}>
            <label className="signup-label" htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder=""
              value={state.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="signup-input"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
            />
            {fieldErrors.password ? (
              <span id="signup-password-error" className="field-error">
                {fieldErrors.password}
              </span>
            ) : null}
          </div>

          {error && (
            <div className="signup-errors" role="alert">
              <ErrorMessage message={error} />
            </div>
          )}

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      </section>
    </main>
  );
}