"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import AttendanceTable from "../../components/AttendanceTable";
import Calendar from "../../components/Calendar";
import Modal from "../../components/Modal";
import type { ApiResponse, User, Attendance } from "../../types";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateAttendances, setDateAttendances] = useState<Attendance[]>([]);

  // Polling for data updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (user) loadData();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user, filters]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      let response;

      if (user.isSSO) {
        response = await api.postWithSSO(
          `/pi/users-attendance-sso?month=${filters.month}&year=${filters.year}`,
          {},
        );
      } else {
        response = await api.get(
          `/pi/users-attendance?month=${filters.month}&year=${filters.year}`,
        );
      }

      if (response.success) {
        setData(response);
      } else {
        setError("Failed to load data");
      }
    } catch (err) {
      setError("Error connecting to server: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, filters.month, filters.year]);

  const handleDownloadExcel = (user: User) => {
    const attendanceRows = user.attendances.map((att) => ({
      Date: new Date(att.date).toLocaleDateString(),
      "Check-in Time": att.checkinTime
        ? new Date(att.checkinTime).toLocaleTimeString()
        : "N/A",
      "Check-out Time": att.checkoutTime
        ? new Date(att.checkoutTime).toLocaleTimeString()
        : "Not Checked Out",
      Session: att.sessionType || "N/A",
      Type: att.attendanceType || "In Progress",
      "Location Type": att.locationType || "CAMPUS",
      Location: att.takenLocation || "Not specified",
      Status: att.checkoutTime ? "Completed" : "In Progress",
      "Has Photo": att.photo ? "Yes" : "No",
      "Has Audio": att.audio ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(attendanceRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(
      wb,
      `${user.username}_attendance_${filters.month}_${filters.year}.xlsx`,
    );
  };

  const handleDateSelect = (date: string, attendances: Attendance[]) => {
    setSelectedDate(date);
    setDateAttendances(attendances);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="dashboard-content" style={{ padding: '2rem', backgroundColor: '#fdfbfc' }}>
      <div className="dashboard-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <select
          value={filters.month}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, month: parseInt(e.target.value) }))
          }
          style={{ padding: '0.5rem 1rem', border: '2px solid black', borderRadius: '0', background: 'white' }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleDateString("en-US", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: parseInt(e.target.value) }))
          }
          style={{ padding: '0.5rem 1rem', border: '2px solid black', borderRadius: '0', background: 'white' }}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        <button 
          onClick={loadData} 
          style={{ 
            padding: '0.5rem 1rem', 
            background: 'black', 
            color: 'white', 
            border: '2px solid black', 
            borderRadius: '0', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Integrated Calendar */}
      <Calendar 
        month={filters.month} 
        year={filters.year} 
        users={data?.data || []} 
        onDateClick={handleDateSelect}
      />

      <AttendanceTable
        data={data}
        loading={loading}
        error={error}
        onViewDetails={(user) => setModalData(user)}
        onDownloadExcel={handleDownloadExcel}
        selectedDate={selectedDate}
        dateAttendances={dateAttendances}
      />

      {modalData && (
        <Modal user={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}