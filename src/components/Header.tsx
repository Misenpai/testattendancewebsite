'use client';

import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header" style={{ 
      backgroundColor: 'white', 
      borderBottom: '2px solid black',
      boxShadow: '4px 4px 0px rgba(0,0,0,1)'
    }}>
      <div className="header-content" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 2rem'
      }}>
        <h1 style={{ 
          color: 'black', 
          fontSize: '2rem', 
          fontWeight: 'bold',
          margin: 0
        }}>
          PI Dashboard
        </h1>
        <div className="header-user" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem',
          color: 'black'
        }}>
          <NotificationBell />
          <span>Welcome, {user?.username}</span>
          <button 
            onClick={logout} 
            className="logout-btn"
            style={{
              padding: '0.5rem 1rem',
              background: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '0',
              cursor: 'pointer',
              fontWeight: 'bold',
              border: '2px solid black'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}