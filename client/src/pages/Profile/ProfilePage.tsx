import { useState, type MouseEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import userService from '../../utils/userService';
import '../Dashboard/Dashboard.css';

type ModalProps = { children: ReactNode; onClose: () => void };

function Modal({ children, onClose }: ModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }
  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <div className="modal-card">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useUser();
  const navigate = useNavigate();

  // "username" is the email in this app
  const [username, setUsername] = useState(user?.email ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleSave() {
  setError('');
  try {
    await userService.update({ email: username.trim() });
    refreshUser();
    navigate('/dashboard', {
      state: { flash: 'Your profile was successfully updated.' },
    });
  } catch (err) {
    console.error('profile save failed:', err); // ← see the real reason in console
    setError(err instanceof Error ? err.message : 'Unable to save changes.');
  }
}

  async function handleDeleteAccount() {
    try {
      await userService.deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete account.');
      setConfirmDelete(false);
    }
  }

  return (
    <main className="dashboard-page">
      <div className="recipe-list-page">
        <nav className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/dashboard')} type="button">
            Home
          </button>
          <span className="breadcrumb-sep"> &gt; </span>
          <span className="breadcrumb-current">Your Profile</span>
        </nav>

        <h1>Your Profile</h1>

        <div className="profile-form">
          <label>
            Username
            <input
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              value={username}
            />
          </label>

          <label>
            Password
            <input readOnly type="password" value="placeholder123" />
          </label>

          {error && <p className="error-message">{error}</p>}

          <div className="dashboard-buttons">
            <button className="primary-button" onClick={handleSave} type="button">
              Save Changes
            </button>

            <button className="secondary-button" onClick={handleLogout} type="button">
              Log Out
            </button>

            <button
              className="text-button delete-account-link"
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <h2>Delete account?</h2>
          <p>
            Do you want to delete your account?
            <br />
            This action cannot be undone.
          </p>

          <button className="primary-button" onClick={handleDeleteAccount} type="button">
            Yes, Delete Account
          </button>

          <button className="secondary-button" onClick={() => setConfirmDelete(false)} type="button">
            Nevermind
          </button>
        </Modal>
      )}
    </main>
  );
}
