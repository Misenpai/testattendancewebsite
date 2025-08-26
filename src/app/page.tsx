// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import FiltersSection from './components/FiltersSection';
import StatsGrid from './components/StatsGrid';
import AttendanceTable from './components/AttendanceTable';
import Modal from './components/Modal';
import type { ApiResponse, Filters, User } from './types';
import './globals.css';
import * as XLSX from 'xlsx';

export default function AttendanceDashboard(): React.JSX.Element {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [modalData, setModalData] = useState<User | null>(null);

  // ⚠️  Replace the placeholder below with your actual server URL
  const [filters, setFilters] = useState<Filters>({
    month: new Date().getMonth() + 1,
    year: 2025,
    apiBase: 'http://10.150.8.74:3000/api'
  });

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${filters.apiBase}/admin/users-attendance?month=${filters.month}&year=${filters.year}`
      );
      const result: ApiResponse = await response.json();
      if (result.success) {
        setData(result);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      setError('Error connecting to server: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters.apiBase, filters.month, filters.year]);

  const handleLocationTypeChange = async (
    empCode: string,
    newType: 'APPROX' | 'ABSOLUTE'
  ): Promise<void> => {
    try {
      const res = await fetch(`${filters.apiBase}/user-location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empCode, locationType: newType })
      });

      if (!res.ok) {
        console.error('Failed to update location type');
        return;
      }

      // Optimistically update local state
      setData(prev =>
        prev
          ? {
              ...prev,
              data: prev.data.map(u =>
                u.empCode === empCode ? { ...u, locationType: newType } : u
              )
            }
          : null
      );
    } catch (err) {
      console.error('Error updating location type:', err);
    }
  };

  const handleDownloadExcel = (user: User): void => {
    const attendanceRows = user.attendances.map(att => ({
      Date: new Date(att.date).toLocaleDateString(),
      Session: att.sessionType || 'N/A',
      Type: att.attendanceType || 'In Progress',
      'Check-in Time': new Date(att.checkInTime).toLocaleTimeString(),
      'Check-out Time': att.checkOutTime
        ? new Date(att.checkOutTime).toLocaleTimeString()
        : 'N/A',
      Location: att.takenLocation || att.location || 'Not specified',
      Status: att.isCheckedOut ? 'Completed' : 'In Progress',
      Photos: att.photos.length,
      Audio: att.audio.length > 0 ? 'Yes' : 'No'
    }));

    // Attendance sheet
    const ws = XLSX.utils.json_to_sheet(attendanceRows);

    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    // User-info sheet
    const userInfo = [
      ['Employee Code', user.empCode],
      ['Username', user.username],
      ['Email', user.email],
      ['Department', user.department],
      ['Location Type', user.locationType],
      ['Status', user.isActive ? 'Active' : 'Inactive'],
      [''],
      ['Monthly Statistics'],
      ['Total Days', user.monthlyStatistics?.totalDays?.toFixed(1) || '0'],
      ['Full Days', user.monthlyStatistics?.fullDays || '0'],
      ['Half Days', user.monthlyStatistics?.halfDays || '0']
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(userInfo);
    XLSX.utils.book_append_sheet(wb, wsInfo, 'User Info');

    // Download
    XLSX.writeFile(
      wb,
      `${user.username}_attendance_${filters.month}_${filters.year}.xlsx`
    );
  };

  const handleFilterChange = (newFilters: Filters): void => {
    setFilters(newFilters);
  };

  const handleViewDetails = (user: User): void => setModalData(user);
  const closeModal = (): void => setModalData(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="container">
      <header>
        <h1>Attendance Dashboard</h1>
      </header>

      <FiltersSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onLoadData={loadData}
      />

      <StatsGrid data={data} />

      <AttendanceTable
        data={data}
        loading={loading}
        error={error}
        onViewDetails={handleViewDetails}
        updateLocationType={handleLocationTypeChange}
        onDownloadExcel={handleDownloadExcel}
        apiBase={filters.apiBase}
      />

      {modalData && (
        <Modal user={modalData} onClose={closeModal} />
      )}
    </div>
  );
}