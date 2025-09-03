// src/app/components/FieldTripModal.tsx
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
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal')) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Field Trips - {user.username}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="field-trip-info">
            <p><strong>Employee Number:</strong> {user.employeeNumber}</p>
            <p><strong>Projects:</strong> {user.projects.map(p => p.projectCode).join(', ')}</p>
          </div>

          {loading ? (
            <p>Loading field trips…</p>
          ) : (
            <>
              <div className="field-trip-form">
                <h3>Schedule New Field Trip</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={newTrip.endDate}
                      min={newTrip.startDate}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    value={newTrip.description}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, description: e.target.value })
                    }
                    placeholder="e.g., Client visit, Training"
                  />
                </div>
                <button className="add-trip-btn" onClick={handleAddTrip}>
                  Schedule Field Trip
                </button>
              </div>

              <div className="field-trips-list">
                <h3>Scheduled Field Trips</h3>
                {fieldTrips.length === 0 ? (
                  <p className="no-trips">No field trips scheduled</p>
                ) : (
                  fieldTrips.map((trip, index) => (
                    <div
                      key={index}
                      className={`trip-item ${
                        isCurrentlyOnTrip(trip) ? 'active-trip' : ''
                      }`}
                    >
                      <div className="trip-info">
                        <span className="trip-dates">
                          {new Date(trip.startDate).toLocaleDateString()} -{' '}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                        {trip.description && (
                          <span className="trip-description">
                            {trip.description}
                          </span>
                        )}
                        {isCurrentlyOnTrip(trip) && (
                          <span className="current-trip-badge">ACTIVE NOW</span>
                        )}
                      </div>
                      <button
                        className="remove-trip-btn"
                        onClick={() => handleRemoveTrip(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave}>
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