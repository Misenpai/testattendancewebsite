// src/app/components/Modal.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import type { User, Photo, Audio, Attendance } from '../types';

interface ModalProps {
  user: User;
  onClose: () => void;
}

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
    if ((e.target as HTMLElement).classList.contains('modal')) {
      onClose();
    }
  };

  const getSessionColor = (sessionType?: string) => {
    if (sessionType === 'FORENOON') return '#17a2b8';
    if (sessionType === 'AFTERNOON') return '#ffc107';
    return '#6c757d';
  };

  const getAttendanceTypeLabel = (att: Attendance) => {
    if (!att.isCheckedOut) return 'In Progress';
    return att.attendanceType === 'FULL_DAY' ? 'Full Day' : 'Half Day';
  };

  const getAttendanceTypeColor = (att: Attendance) => {
    if (!att.isCheckedOut) return '#ffc107';
    return att.attendanceType === 'FULL_DAY' ? '#28a745' : '#17a2b8';
  };

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user.username} - Attendance Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-info">
            <strong>Employee Code:</strong> {user.empCode}<br />
            <strong>Email:</strong> {user.email}<br />
            <strong>Department:</strong> {user.department}<br />
            <strong>Location Type:</strong> {user.locationType}<br />
          </div>
          
          {/* Monthly Statistics */}
          {user.monthlyStatistics && (
            <div className="stats-summary">
              <h3>Monthly Summary</h3>
              <div className="stats-row">
                <span className="stat-item">
                  <strong>Total Days:</strong> {user.monthlyStatistics.totalDays.toFixed(1)}
                </span>
                <span className="stat-item">
                  <strong>Full Days:</strong> {user.monthlyStatistics.fullDays}
                </span>
                <span className="stat-item">
                  <strong>Half Days:</strong> {user.monthlyStatistics.halfDays}
                </span>
              </div>
            </div>
          )}
          
          <h3>Attendance Records</h3>
          
          <div className="search-container">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Search by date..."
              className="date-search"
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
            <p>No attendance records found {searchDate ? 'for selected date' : 'for this month'}</p>
          ) : (
            filteredAttendances.map((att, index: number) => {
              const date = new Date(att.date);
              const checkIn = new Date(att.checkInTime);
              const checkOut = att.checkOutTime ? new Date(att.checkOutTime) : null;
              
              return (
                <div key={index} className="attendance-item">
                  <div className="attendance-date">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="attendance-details">
                    <div className="attendance-row">
                      <div>
                        <strong>Session:</strong> 
                        <span 
                          className="session-badge"
                          style={{ 
                            backgroundColor: getSessionColor(att.sessionType),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginLeft: '8px'
                          }}
                        >
                          {att.sessionType || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <strong>Type:</strong> 
                        <span 
                          className="type-badge"
                          style={{ 
                            backgroundColor: getAttendanceTypeColor(att),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginLeft: '8px'
                          }}
                        >
                          {getAttendanceTypeLabel(att)}
                        </span>
                      </div>
                    </div>
                    <div className="attendance-row">
                      <div><strong>Check-in:</strong> {checkIn.toLocaleTimeString()}</div>
                      {checkOut && (
                        <div><strong>Check-out:</strong> {checkOut.toLocaleTimeString()}</div>
                      )}
                    </div>
                    <div>
                      <strong>Location:</strong> {att.takenLocation || att.location || 'Not specified'}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span className={`status-badge ${att.isCheckedOut ? 'checked-out' : 'in-progress'}`}>
                        {att.isCheckedOut ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  <div className="media-links">
                    {att.photos.map((p: Photo, i: number) => (
                      <a 
                        key={i}
                        href={p.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="media-link"
                      >
                        📷 Photo {i + 1} ({p.type || 'unknown'})
                      </a>
                    ))}
                    {att.audio.map((a: Audio, i: number) => (
                      <a 
                        key={i}
                        href={a.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="media-link"
                      >
                        🎵 Audio ({a.duration ? a.duration + 's' : 'unknown'})
                      </a>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}