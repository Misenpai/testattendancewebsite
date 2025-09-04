'use client';

import React, { useState, useEffect } from 'react';
import type { User, Photo, Audio, Attendance } from '../types';

interface ModalProps {
  user: User;
  onClose: () => void;
}

const modalStyles = `
/* Variables for colors */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-info: #17a2b8;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-light: #f8f9fa;
  --color-dark: #343a40;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

/* Modal Container */
.modal-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-dark);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: var(--color-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-dark);
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-info {
  line-height: 1.6;
  font-size: 1rem;
  color: #555;
  background-color: var(--color-light);
  padding: 1rem;
  border-radius: 6px;
}

.card {
  background-color: #fefefe;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Stats Summary */
.stats-summary h3, .section-title {
  margin-top: 0;
  font-size: 1.25rem;
  color: var(--color-dark);
  border-bottom: 2px solid var(--color-primary);
  display: inline-block;
  padding-bottom: 5px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.1rem;
}

.stat-item strong {
  color: #333;
}

.stat-item span {
  font-weight: 600;
  color: var(--color-primary);
  margin-top: 5px;
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-search-input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.clear-search-btn {
  padding: 0.75rem 1rem;
  background-color: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.clear-search-btn:hover {
  background-color: #5a6268;
}

/* Attendance List and Items */
.attendance-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.no-records-message {
  text-align: center;
  color: var(--color-secondary);
  font-style: italic;
  padding: 2rem;
}

.attendance-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attendance-date {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-dark);
  border-bottom: 1px dashed #ccc;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.attendance-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-item {
  flex: 1;
  min-width: 200px;
}

.badge {
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 8px;
  display: inline-block;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 8px;
}

.status-badge.completed {
  background-color: var(--color-success);
  color: #fff;
}

.status-badge.in-progress {
  background-color: var(--color-warning);
  color: var(--color-dark);
}

/* Media Links */
.media-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 1rem;
}

.media-link {
  padding: 8px 12px;
  border-radius: 4px;
  text-decoration: none;
  color: white;
  font-weight: 500;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.media-link.photo-link {
  background-color: var(--color-primary);
}
.media-link.photo-link:hover {
  background-color: #0056b3;
}

.media-link.audio-link {
  background-color: var(--color-secondary);
}
.media-link.audio-link:hover {
  background-color: #5a6268;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-container {
    max-width: 95%;
  }

  .stats-row, .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`;

export default function Modal({ user, onClose }: ModalProps): React.JSX.Element {
  const [searchDate, setSearchDate] = useState<string>('');
  const [filteredAttendances, setFilteredAttendances] = useState(user.attendances);

  useEffect(() => {
    if (searchDate) {
      const filtered = user.attendances.filter(att => {
        const attDate = new Date(att.date).toISOString().split('T')[0];
        return attDate === searchDate;
      });
      setFilteredAttendances(filtered);
    } else {
      setFilteredAttendances(user.attendances);
    }
  }, [searchDate, user.attendances]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  const getSessionColor = (sessionType?: string) => {
    if (sessionType === 'FN') return 'var(--color-info)';
    if (sessionType === 'AF') return 'var(--color-warning)';
    return 'var(--color-secondary)';
  };

  const getAttendanceTypeLabel = (att: Attendance) => {
    if (!att.isCheckedOut) return 'In Progress';
    if (att.isFullDay) return 'Full Day';
    if (att.isHalfDay) return 'Half Day';
    return 'N/A';
  };

  const getAttendanceTypeColor = (att: Attendance) => {
    if (!att.isCheckedOut) return 'var(--color-warning)';
    if (att.isFullDay) return 'var(--color-success)';
    if (att.isHalfDay) return 'var(--color-info)';
    return 'var(--color-secondary)';
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">{user.username} - Attendance Details</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-info">
              <strong>Employee Number:</strong> {user.employeeNumber}<br />
              <strong>Employee Class:</strong> {user.empClass}<br />
              <strong>Projects:</strong> {user.projects.map(p => p.projectCode).join(', ')}<br />
            </div>
            
            {user.monthlyStatistics && (
              <div className="stats-summary card">
                <h3>Monthly Summary</h3>
                <div className="stats-row">
                  <div className="stat-item">
                    <strong>Total Days:</strong> <span>{user.monthlyStatistics.totalDays.toFixed(1)}</span>
                  </div>
                  <div className="stat-item">
                    <strong>Full Days:</strong> <span>{user.monthlyStatistics.fullDays}</span>
                  </div>
                  <div className="stat-item">
                    <strong>Half Days:</strong> <span>{user.monthlyStatistics.halfDays}</span>
                  </div>
                </div>
              </div>
            )}
            
            <h3 className="section-title">Attendance Records</h3>
            
            <div className="search-container">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="date-search-input"
              />
              {searchDate && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchDate('')}
                >
                  Clear
                </button>
              )}
            </div>
            
            {filteredAttendances.length === 0 ? (
              <p className="no-records-message">
                No attendance records found {searchDate ? 'for the selected date' : 'for this month'}.
              </p>
            ) : (
              <div className="attendance-list">
                {filteredAttendances.map((att, index: number) => {
                  const checkInDate = new Date(att.checkinTime);
                  const checkOutDate = att.checkoutTime ? new Date(att.checkoutTime) : null;
                  
                  return (
                    <div key={index} className="attendance-item card">
                      <div className="attendance-date">
                        {checkInDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="attendance-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <strong>Session:</strong> 
                            <span 
                              className="badge"
                              style={{ backgroundColor: getSessionColor(att.sessionType) }}
                            >
                              {att.sessionType || 'N/A'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <strong>Type:</strong> 
                            <span 
                              className="badge"
                              style={{ backgroundColor: getAttendanceTypeColor(att) }}
                            >
                              {getAttendanceTypeLabel(att)}
                            </span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-item">
                            <strong>Check-in:</strong> <span>{checkInDate.toLocaleTimeString()}</span>
                          </div>
                          {checkOutDate && (
                            <div className="detail-item">
                              <strong>Check-out:</strong> <span>{checkOutDate.toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="detail-row">
                          <div className="detail-item">
                            <strong>Location:</strong> <span>{att.location?.address || att.takenLocation || 'Not specified'}</span>
                          </div>
                          <div className="detail-item">
                            <strong>Status:</strong> 
                            <span className={`status-badge ${att.isCheckedOut ? 'completed' : 'in-progress'}`}>
                              {att.isCheckedOut ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="media-links">
                        {att.photos?.map((p: Photo, i: number) => (
                          <a 
                            key={i}
                            href={p.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="media-link photo-link"
                          >
                            📷 Photo {i + 1} ({p.type || 'unknown'})
                          </a>
                        ))}
                        {att.audio?.map((a: Audio, i: number) => (
                          <a 
                            key={i}
                            href={a.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="media-link audio-link"
                          >
                            🎵 Audio ({a.duration ? a.duration + 's' : 'unknown'})
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}