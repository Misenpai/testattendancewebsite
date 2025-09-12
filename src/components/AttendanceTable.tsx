"use client";

import { useState } from "react";
import FieldTripModal from "./FieldTripModel";
import type { ApiResponse, User, FieldTrip, Attendance } from "../types";
import Button from "./Button";

interface AttendanceTableProps {
  data: ApiResponse | null;
  loading: boolean;
  error: string;
  onViewDetails: (user: User) => void;
  selectedDate?: string;
  dateAttendances?: Attendance[];
}

export default function AttendanceTable({
  data,
  loading,
  error,
  onViewDetails,
  selectedDate,
  dateAttendances,
}: AttendanceTableProps) {
  const [fieldTripModalUser, setFieldTripModalUser] = useState<User | null>(null);

  if (loading) {
    return (
      <div className="users-table" style={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
        <div className="table-header" style={{ padding: '1.5rem', background: '#f7fafc', borderBottom: '2px solid black' }}>
          <h2 style={{ color: 'black', margin: 0 }}>Employee Attendance Records</h2>
        </div>
        <div className="loading" style={{ padding: '2rem', textAlign: 'center', color: 'black' }}>Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-table" style={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
        <div className="table-header" style={{ padding: '1.5rem', background: '#f7fafc', borderBottom: '2px solid black' }}>
          <h2 style={{ color: 'black', margin: 0 }}>Employee Attendance Records</h2>
        </div>
        <div className="error" style={{ padding: '1rem', color: 'black', background: '#fed7cc' }}>{error}</div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="users-table" style={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
        <div className="table-header" style={{ padding: '1.5rem', background: '#f7fafc', borderBottom: '2px solid black' }}>
          <h2 style={{ color: 'black', margin: 0 }}>Employee Attendance Records</h2>
        </div>
        <div className="loading" style={{ padding: '2rem', textAlign: 'center', color: 'black' }}>No data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="users-table" style={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px rgba(0,0,0,1)', overflow: 'hidden' }}>
        <div className="table-header" style={{ padding: '1.5rem', background: '#f7fafc', borderBottom: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'black', margin: 0 }}>Employee Attendance Records</h2>
          <div className="header-info" style={{ color: 'black', fontSize: '0.9rem' }}>
            <span>Month: {data.month}/{data.year}</span>
            <span>Total Users: {data.totalUsers}</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Employee Number</th>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Username</th>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Class</th>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Projects</th>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Monthly Stats</th>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Field Trip Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', background: '#f7fafc', fontWeight: '600', color: 'black', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid black' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.data.map((user: User, index: number) => (
              <tr key={user.employeeNumber || index} className="user-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem', color: 'black' }}>{user.employeeNumber}</td>
                <td style={{ padding: '1rem', color: 'black' }}>{user.username}</td>
                <td style={{ padding: '1rem', color: 'black' }}>{user.empClass}</td>
                <td style={{ padding: '1rem', color: 'black' }}>
                  <div className="project-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {user.projects.map((p) => (
                      <span key={p.projectCode} className="project-tag" style={{ 
                        background: '#e2e8f0', 
                        color: 'black', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0', 
                        fontSize: '0.8rem', 
                        fontWeight: '500',
                        border: '1px solid black'
                      }}>
                        {p.projectCode}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'black' }}>
                  <div className="monthly-stats" style={{ display: 'flex', gap: '0.25rem' }}>
                    <span
                      title="Full Days"
                      style={{ background: "#d4edda", color: "#155724", padding: '0.25rem 0.5rem', borderRadius: '0', fontSize: '0.8rem', fontWeight: '600', border: '1px solid black' }}
                    >
                      {user.monthlyStatistics.fullDays}F
                    </span>
                    <span
                      title="Half Days"
                      style={{ background: "#cce5ff", color: "#004085", padding: '0.25rem 0.5rem', borderRadius: '0', fontSize: '0.8rem', fontWeight: '600', border: '1px solid black' }}
                    >
                      {user.monthlyStatistics.halfDays}H
                    </span>
                    <span
                      title="Not Checked Out"
                      style={{ background: "#fff3cd", color: "#856404", padding: '0.25rem 0.5rem', borderRadius: '0', fontSize: '0.8rem', fontWeight: '600', border: '1px solid black' }}
                    >
                      {user.monthlyStatistics.notCheckedOut}NC
                    </span>
                    <span
                      title="Total Days"
                      style={{ background: "#f8f9fa", color: "#495057", padding: '0.25rem 0.5rem', borderRadius: '0', fontSize: '0.8rem', fontWeight: '600', border: '1px solid black' }}
                    >
                      {user.monthlyStatistics.totalDays}T
                    </span>
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'black' }}>
                  <div className="field-trip-status" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Button
                      buttonText="Manage"
                      onClick={() => setFieldTripModalUser(user)}
                      style={{ 
                        background: 'white', 
                        color: 'black', 
                        border: '2px solid black', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        boxShadow: '2px 2px 0px rgba(0,0,0,1)'
                      }}
                    />
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'black' }}>
                  <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      buttonText="View"
                      onClick={() => onViewDetails(user)}
                      style={{ 
                        background: 'black', 
                        color: 'white', 
                        border: '2px solid black', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '0',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    />
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
          onClose={() => setFieldTripModalUser(null)}
          onSave={async (employeeNumber: string, fieldTrips: FieldTrip[]) => {
            try {
              console.log("Saving field trips for:", employeeNumber, fieldTrips);
              alert("Field trips saved successfully!");
            } catch (error) {
              console.error("Error saving field trips:", error);
              alert("Failed to save field trips.");
            }
          }}
        />
      )}

      {selectedDate && dateAttendances && dateAttendances.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: 'white', 
          border: '2px solid black',
          borderRadius: '0',
          boxShadow: '4px 4px 0px rgba(0,0,0,1)'
        }}>
          <h3 style={{ color: 'black', marginBottom: '1rem' }}>Attendance for {selectedDate}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {dateAttendances.map((att, idx) => (
              <li key={idx} style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0', color: 'black' }}>
                {att.username || 'Unknown'}: Check-in {new Date(att.checkinTime).toLocaleTimeString()}, 
                {att.checkoutTime ? `Check-out ${new Date(att.checkoutTime).toLocaleTimeString()}` : 'No Check-out'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}