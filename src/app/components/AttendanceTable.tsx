// src/app/components/AttendanceTable.tsx
"use client";

import { useState } from "react";
import FieldTripModal from "./FieldTripModel";
import type { ApiResponse, User, FieldTrip } from "../types";

interface AttendanceTableProps {
  data: ApiResponse | null;
  loading: boolean;
  error: string;
  onViewDetails: (user: User) => void;
  onDownloadExcel: (user: User) => void;
  apiBase: string;
  updateLocationType: (
    empCode: string,  // Changed from empId
    newType: "APPROX" | "ABSOLUTE",
  ) => Promise<void>;
}

export default function AttendanceTable({
  data,
  loading,
  error,
  onViewDetails,
  onDownloadExcel,
  apiBase,
  updateLocationType,
}: AttendanceTableProps): React.JSX.Element {
  const [fieldTripModalUser, setFieldTripModalUser] = useState<User | null>(
    null,
  );

  const locationTypes: Array<"APPROX" | "ABSOLUTE"> = [
    "APPROX",
    "ABSOLUTE",
  ];

  const handleLocationTypeChange = async (
    empCode: string,  // Changed from empId
    newType: "APPROX" | "ABSOLUTE",
  ) => {
    await updateLocationType(empCode, newType);
  };

  const handleSaveFieldTrips = async (empCode: string, fieldTrips: FieldTrip[]) => {
    try {
      console.log('Saving field trips:', { empCode, fieldTrips });

      const response = await fetch(`${apiBase}/user-location/field-trips`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empCode: empCode,  // Changed from empId
          fieldTripDates: fieldTrips,
        }),
      });

      const result = await response.json();
      console.log('Field trips save response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save field trips');
      }
      
      alert('Field trips saved successfully!');
      
    } catch (error) {
      console.error("Error saving field trips:", error);
      alert('Failed to save field trips. Please try again.');
    }
  };

  const isOnFieldTrip = (user: User): boolean => {
    if (!user.fieldTrips || user.fieldTrips.length === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return user.fieldTrips.some(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return today >= startDate && today <= endDate;
    });
  };

  const getAttendanceTypeColor = (attendanceType?: 'FULL_DAY' | 'HALF_DAY') => {
    if (!attendanceType) return '#FFA500'; // Orange for in progress
    return attendanceType === 'FULL_DAY' ? '#10B981' : '#3B82F6'; // Green for full, Blue for half
  };

  if (loading) {
    return (
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
        </div>
        <div className="loading">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
        </div>
        <div className="loading">No data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
          <div className="header-info">
            <span>Month: {data.month}/{data.year}</span>
            <span>Total Users: {data.totalUsers}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Username</th>
              <th>Email</th>
              <th>Department</th>
              <th>Monthly Stats</th>
              <th>Location Type</th>
              <th>Field Trips</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.data.map((user: User, index: number) => (
              <tr key={user.empCode || index} className="user-row">
                <td>{user.empCode}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                
                <td>
                  {user.monthlyStatistics ? (
                    <div className="monthly-stats">
                      <span 
                        title="Full Days" 
                        style={{ background: '#d4edda', color: '#155724' }}
                      >
                        {user.monthlyStatistics.fullDays}F
                      </span>
                      <span 
                        title="Half Days"
                        style={{ background: '#cce5ff', color: '#004085' }}
                      >
                        {user.monthlyStatistics.halfDays}H
                      </span>
                      <span 
                        title="Total Days"
                        style={{ background: '#f8f9fa', color: '#495057' }}
                      >
                        {user.monthlyStatistics.totalDays.toFixed(1)}T
                      </span>
                    </div>
                  ) : (
                    <span className="no-stats">No data</span>
                  )}
                </td>

                <td>
                  <div className="location-type-cell">
                    <select
                      className="location-select"
                      value={user.locationType}
                      onChange={(e) =>
                        handleLocationTypeChange(
                          user.empCode,  // Changed from empId
                          e.target.value as "APPROX" | "ABSOLUTE",
                        )
                      }
                    >
                      {locationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    
                    {isOnFieldTrip(user) && (
                      <div className="field-trip-indicator">
                        🏃‍♂️ On Field Trip
                      </div>
                    )}
                  </div>
                </td>

                <td>
                  <button
                    className="manage-trips-btn"
                    onClick={() => setFieldTripModalUser(user)}
                  >
                    📅 Manage
                  </button>
                  {user.fieldTrips && user.fieldTrips.length > 0 && (
                    <div className="field-trip-count">
                      {user.fieldTrips.length} scheduled
                    </div>
                  )}
                </td>

                <td>
                  <span
                    className={`badge ${
                      user.isActive ? "badge-active" : "badge-inactive"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => onViewDetails(user)}
                    >
                      View
                    </button>
                    <button
                      className="download-btn"
                      onClick={() => onDownloadExcel(user)}
                    >
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fieldTripModalUser && (
        <FieldTripModal
          user={fieldTripModalUser}
          apiBase={apiBase}
          onClose={() => setFieldTripModalUser(null)}
          onSave={handleSaveFieldTrips}
        />
      )}
    </>
  );
}