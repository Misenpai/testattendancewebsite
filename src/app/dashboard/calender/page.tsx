// src/app/dashboard/calendar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import Calendar from '../../components/Calendar';
import type { User } from '../../types';

export default function CalendarPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    const loadUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await api.get(
          `/pi/users-attendance?month=${filters.month}&year=${filters.year}`
        );
        
        if (response.success) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user, filters.month, filters.year]);

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Attendance Calendar</h1>
        <div className="calendar-filters">
          <select 
            value={filters.month} 
            onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
          
          <select 
            value={filters.year} 
            // FIX: Changed e.target.year to e.target.value
            onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading calendar...</div>
      ) : (
        <Calendar 
          month={filters.month} 
          year={filters.year} 
          users={users} 
        />
      )}
    </div>
  );
}