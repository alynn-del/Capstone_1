import { CircleUser  ,MessageCircle} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import "./Header.css";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="app-header">
      <Link to="/Dashboard" className="logo-link" aria-label="Spoonful home">
        <img src="/Logo.png"  className="app-logo" />
      </Link>

         <div className="header-actions">
        <Link
        to="/ai-assistant"
        className="assistant-btn"
        aria-label="Chat with assistant"
        >
        <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
        <span>Chat with Assistant</span>
        </Link>
        </div>
      <Link
        to={user ? "/profile" : "/login"}
        className="profile-link"
        aria-label={user ? "Open profile" : "Log in"}
      >
        <CircleUser size={24} strokeWidth={2} aria-hidden="true" />
      </Link>
    </header>
  );
}