// src/app/components/Header.tsx
'use client';

import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <h1>PI Dashboard</h1>
        <div className="header-user">
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