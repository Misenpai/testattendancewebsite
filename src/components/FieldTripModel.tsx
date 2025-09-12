// src/app/components/FieldTripModel.tsx - Neo-Brutalism styling
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User, FieldTrip } from '../types';

interface FieldTripModalProps {
  user: User;
  onClose: () => void;
  onSave: (employeeNumber: string, fieldTrips: FieldTrip[]) => void;
}

export default function FieldTripModal({
  user,
  onClose,
  onSave,
}: FieldTripModalProps) {
  const [fieldTrips, setFieldTrips] = useState<FieldTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrip, setNewTrip] = useState<FieldTrip>({
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    const fetchFieldTrips = async () => {
      try {
        const response = await api.get(`/field-trips/${user.employeeNumber}`);
        
        if (response.success && response.data?.fieldTrips) {
          setFieldTrips(
            response.data.fieldTrips.map((trip: any) => ({
              startDate: trip.startDate.split('T')[0],
              endDate: trip.endDate.split('T')[0],
              description: trip.description || '',
            }))
          );
        } else {
          setFieldTrips([]);
        }
      } catch (err) {
        console.error('Error fetching field trips:', err);
        setFieldTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldTrips();
  }, [user.employeeNumber]);

  const handleAddTrip = () => {
    if (newTrip.startDate && newTrip.endDate) {
      const startDate = new Date(newTrip.startDate);
      const endDate = new Date(newTrip.endDate);

      if (startDate > endDate) {
        alert('End date must be after start date');
        return;
      }

      setFieldTrips([...fieldTrips, { ...newTrip }]);
      setNewTrip({ startDate: '', endDate: '', description: '' });
    } else {
      alert('Please fill in both start and end dates');
    }
  };

  const handleRemoveTrip = (index: number) => {
    setFieldTrips(fieldTrips.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/field-trips', {
        employeeNumber: user.employeeNumber,
        fieldTripDates: fieldTrips,
      });

      if (response.success) {
        alert('Field trips saved successfully!');
        onSave(user.employeeNumber, fieldTrips);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to save field trips');
      }
    } catch (error) {
      console.error('Error saving field trips:', error);
      alert('Failed to save field trips. Please try again.');
    }
  };

  const isCurrentlyOnTrip = (trip: FieldTrip): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return today >= startDate && today <= endDate;
  };

  return (
    <div
      className="modal active"
      style={{ 
        display: 'flex', 
        position: 'fixed', 
        zIndex: 1000, 
        left: 0, 
        top: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.5)' 
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal')) onClose();
      }}
    >
      <div className="modal-content" style={{ 
        background: 'white', 
        padding: 0, 
        borderRadius: 0, 
        boxShadow: '8px 8px 0px rgba(0,0,0,1)', 
        width: '90%', 
        maxWidth: '800px', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        border: '2px solid black'
      }}>
        <div className="modal-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.5rem', 
          background: '#f7fafc', 
          borderBottom: '2px solid black' 
        }}>
          <h2 style={{ color: 'black', margin: 0 }}>Manage Field Trips - {user.username}</h2>
          <button className="close-btn" onClick={onClose} style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer', 
            color: 'black', 
            padding: '0.5rem' 
          }}>
            ×
          </button>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          <div className="field-trip-info" style={{ 
            background: '#f7fafc', 
            padding: '1rem', 
            borderRadius: 0, 
            marginBottom: '2rem',
            border: '1px solid black'
          }}>
            <p style={{ marginBottom: '0.5rem', color: 'black' }}><strong>Employee Number:</strong> {user.employeeNumber}</p>
            <p style={{ marginBottom: '0.5rem', color: 'black' }}><strong>Projects:</strong> {user.projects.map(p => p.projectCode).join(', ')}</p>
          </div>

          {loading ? (
            <p style={{ color: 'black' }}>Loading field trips…</p>
          ) : (
            <>
              <div className="field-trip-form" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'black', marginBottom: '1rem' }}>Schedule New Field Trip</h3>
                <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'black' }}>Start Date</label>
                    <input
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, startDate: e.target.value })
                      }
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid black', borderRadius: '0' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'black' }}>End Date</label>
                    <input
                      type="date"
                      value={newTrip.endDate}
                      min={newTrip.startDate}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, endDate: e.target.value })
                      }
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid black', borderRadius: '0' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'black' }}>Description (Optional)</label>
                  <input
                    type="text"
                    value={newTrip.description}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, description: e.target.value })
                    }
                    placeholder="e.g., Client visit, Training"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid black', borderRadius: '0' }}
                  />
                </div>
                <button 
                  className="add-trip-btn" 
                  onClick={handleAddTrip}
                  style={{ 
                    background: 'black', 
                    color: 'white', 
                    padding: '0.75rem 1.5rem', 
                    border: 'none', 
                    borderRadius: '0', 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    border: '2px solid black',
                    boxShadow: '2px 2px 0px rgba(0,0,0,1)'
                  }}
                >
                  Schedule Field Trip
                </button>
              </div>

              <div className="field-trips-list">
                <h3 style={{ color: 'black', marginBottom: '1rem' }}>Scheduled Field Trips</h3>
                {fieldTrips.length === 0 ? (
                  <p className="no-trips" style={{ color: 'black', textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '0', border: '1px solid black' }}>No field trips scheduled</p>
                ) : (
                  fieldTrips.map((trip, index) => (
                    <div
                      key={index}
                      className={`trip-item ${isCurrentlyOnTrip(trip) ? 'active-trip' : ''}`}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1rem', 
                        background: '#f7fafc', 
                        borderRadius: '0', 
                        marginBottom: '0.5rem', 
                        border: '1px solid black',
                        borderLeft: '4px solid black'
                      }}
                    >
                      <div className="trip-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span className="trip-dates" style={{ fontWeight: '600', color: 'black' }}>
                          {new Date(trip.startDate).toLocaleDateString()} -{' '}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                        {trip.description && (
                          <span className="trip-description" style={{ color: 'black', fontSize: '0.9rem' }}>
                            {trip.description}
                          </span>
                        )}
                        {isCurrentlyOnTrip(trip) && (
                          <span className="current-trip-badge" style={{ 
                            background: 'black', 
                            color: 'white', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '0', 
                            fontSize: '0.7rem', 
                            fontWeight: '600', 
                            textTransform: 'uppercase',
                            border: '1px solid black'
                          }}>ACTIVE NOW</span>
                        )}
                      </div>
                      <button
                        className="remove-trip-btn"
                        onClick={() => handleRemoveTrip(index)}
                        style={{ 
                          background: 'black', 
                          color: 'white', 
                          border: 'none', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '0', 
                          cursor: 'pointer', 
                          fontSize: '0.8rem',
                          border: '2px solid black'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '2px solid black' }}>
                <button 
                  className="cancel-btn" 
                  onClick={onClose}
                  style={{ 
                    background: '#e2e8f0', 
                    color: 'black', 
                    padding: '0.75rem 1.5rem', 
                    border: '2px solid black', 
                    borderRadius: '0', 
                    cursor: 'pointer', 
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleSave}
                  style={{ 
                    background: 'black', 
                    color: 'white', 
                    padding: '0.75rem 1.5rem', 
                    border: '2px solid black', 
                    borderRadius: '0', 
                    cursor: 'pointer', 
                    fontWeight: '600'
                  }}
                >
                  Save Field Trips
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}