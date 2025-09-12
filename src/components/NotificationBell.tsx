'use client';

import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Notification {
  month: string;
  year: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  bellContainer: {
    position: 'relative',
    cursor: 'pointer',
  },
  bellIcon: {
    fontSize: '1.5rem',
    color: '#000',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-10px',
    background: '#000',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: '40px',
    right: '0',
    width: '300px',
    background: 'white',
    border: '2px solid black',
    borderRadius: '0',
    boxShadow: '4px 4px 0px rgba(0,0,0,1)',
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: '1rem',
    fontWeight: 'bold',
    borderBottom: '2px solid black',
    color: 'black'
  },
  notificationItem: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  notificationText: {
    marginBottom: '0.75rem',
    color: 'black'
  },
  sendButton: {
    padding: '0.4rem 0.8rem',
    background: 'black',
    color: 'white',
    borderRadius: '0',
    cursor: 'pointer',
    fontWeight: 'bold',
    border: '2px solid black'
  },
  noNotifications: {
    padding: '1.5rem',
    textAlign: 'center',
    color: '#666',
  }
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/pi/notifications');
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendData = async (month: string, year: string) => {
    try {
      const res = await api.post('/pi/submit-data', { month: parseInt(month), year: parseInt(year) });
      if (res.success) {
        alert(res.message);
        setNotifications(prev => prev.filter(n => !(n.month === month && n.year === year)));
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (error) {
      alert('Failed to send data. Please try again.');
    }
  };

  return (
    <div style={styles.bellContainer}>
      <span style={styles.bellIcon} onClick={() => setIsOpen(!isOpen)}>
        🔔
      </span>
      {notifications.length > 0 && <span style={styles.badge}>{notifications.length}</span>}
      
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>HR Data Requests</div>
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div key={index} style={styles.notificationItem}>
                <p style={styles.notificationText}>
                  Request for attendance data for: <strong>{new Date(0, parseInt(notif.month) - 1).toLocaleString('en-US', { month: 'long' })} {notif.year}</strong>
                </p>
                <button 
                  style={styles.sendButton} 
                  onClick={() => handleSendData(notif.month, notif.year)}
                >
                  Send Data to HR
                </button>
              </div>
            ))
          ) : (
            <div style={styles.noNotifications}>No new requests</div>
          )}
        </div>
      )}
    </div>
  );
}