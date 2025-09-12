'use client';

import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell'; // <-- Import the new component

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <h1>PI Dashboard</h1>
        <div className="header-user" style={{ gap: '1.5rem' }}> {/* Added gap for spacing */}
          <NotificationBell /> {/* <-- Add the bell here */}
          <span>Welcome, {user?.username}</span>
          <span className="project-info">
            Projects: {user?.projects.join(', ')}
          </span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}