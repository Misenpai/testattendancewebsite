"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";
import type { CalendarDay, User, Attendance } from "../types";

interface CalendarProps {
  month: number;
  year: number;
  users: User[];
  onDateClick?: (date: string, attendances: Attendance[]) => void;
}

export default function Calendar({ month, year, users, onDateClick }: CalendarProps) {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateAttendances, setSelectedDateAttendances] = useState<Attendance[]>([]);

  useEffect(() => {
    loadCalendarData();
  }, [month, year]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);

      // Load holidays
      const holidaysRes = await api.get(`/calendar/holidays?year=${year}`);
      const currentYearHolidays = holidaysRes.success
        ? holidaysRes.holidays
        : [];
      setHolidays(currentYearHolidays);

      // Generate calendar days - ONLY for the current month
      const daysInMonth = new Date(year, month, 0).getDate();
      const calendarDays: CalendarDay[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        date.setHours(12, 0, 0, 0);
        const dateStr = date.toISOString().split("T")[0];

        if (date.getMonth() !== month - 1) {
          continue;
        }

        const holidayInfo = currentYearHolidays.find((h: any) => {
          const holidayDate = new Date(h.date);
          return holidayDate.getUTCFullYear() === date.getFullYear() &&
                 holidayDate.getUTCMonth() === date.getMonth() &&
                 holidayDate.getUTCDate() === date.getDate();
        });
        
        const isHoliday = !!holidayInfo;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        const attendances: { [key: string]: any } = {};

        users.forEach((user) => {
          const dayAttendance = user.attendances.find((att) => {
            const attDate = new Date(att.date);
            return attDate.getFullYear() === date.getFullYear() &&
                   attDate.getMonth() === date.getMonth() &&
                   attDate.getDate() === date.getDate();
          });

          if (dayAttendance) {
            attendances[user.employeeNumber] = {
              present: true,
              type:
                dayAttendance.attendanceType === "FULL_DAY"
                  ? "FULL_DAY"
                  : dayAttendance.attendanceType === "HALF_DAY"
                  ? "HALF_DAY"
                  : "IN_PROGRESS",
              username: user.username,
            };
          } else if (!isHoliday && !isWeekend) {
            attendances[user.employeeNumber] = {
              present: false,
              type: "ABSENT",
              username: user.username,
            };
          }
        });

        calendarDays.push({
          date: dateStr,
          isHoliday,
          isWeekend,
          description: holidayInfo?.description,
          attendances,
        });
      }

      setCalendarData(calendarDays);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (dateStr: string) => {
    try {
      // Fetch attendances for specific date
      const attendancesRes = await api.get(`/pi/users-attendance?month=${month}&year=${year}&date=${dateStr}`);
      if (attendancesRes.success) {
        const dateAttendances = attendancesRes.data.flatMap((user: User) => 
          user.attendances.filter((att: Attendance) => {
            const attDate = new Date(att.date).toISOString().split('T')[0];
            return attDate === dateStr;
          })
        );
        setSelectedDateAttendances(dateAttendances);
        onDateClick?.(dateStr, dateAttendances);
      }
    } catch (error) {
      console.error("Error fetching date attendances:", error);
    }
  };

  const getDayClass = (day: CalendarDay) => {
    let classes = "calendar-day";

    if (day.isHoliday) classes += " holiday";
    if (day.isWeekend) classes += " weekend";
    if (day.date === new Date().toISOString().split('T')[0]) classes += " today";

    const attendanceCount = Object.values(day.attendances).length;
    const presentCount = Object.values(day.attendances).filter(
      (a) => a.present
    ).length;

    if (attendanceCount > 0) {
      const presentRatio = presentCount / attendanceCount;
      if (presentRatio === 1) classes += " all-present";
      else if (presentRatio > 0.7) classes += " mostly-present";
      else if (presentRatio > 0.3) classes += " some-present";
      else classes += " mostly-absent";
    }

    return classes;
  };

  if (loading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  return (
    <div className="calendar" style={{
      backgroundColor: 'white',
      border: '2px solid black',
      borderRadius: '0',
      boxShadow: '4px 4px 0px rgba(0,0,0,1)',
      padding: '1rem'
    }}>
      <div className="calendar-header">
        <h2 style={{ color: 'black', margin: '0 0 1rem 0' }}>
          {new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="calendar-legend" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="legend-item all-present" style={{ background: '#c6f6d5', color: '#2f855a', padding: '0.25rem 0.5rem', borderRadius: '0', border: '1px solid black' }}>All Present</span>
          <span className="legend-item mostly-present" style={{ background: '#bee3f8', color: '#2b6cb0', padding: '0.25rem 0.5rem', borderRadius: '0', border: '1px solid black' }}>Mostly Present</span>
          <span className="legend-item some-present" style={{ background: '#feebc8', color: '#c05621', padding: '0.25rem 0.5rem', borderRadius: '0', border: '1px solid black' }}>Some Present</span>
          <span className="legend-item mostly-absent" style={{ background: '#fed7cc', color: '#c53030', padding: '0.25rem 0.5rem', borderRadius: '0', border: '1px solid black' }}>Mostly Absent</span>
          <span className="legend-item holiday" style={{ background: '#e9d8fd', color: '#6b46c1', padding: '0.25rem 0.5rem', borderRadius: '0', border: '1px solid black' }}>Holiday</span>
          <span className="legend-item weekend" style={{ background: '#f0f0f0', color: '#666', padding: '0.25rem 0.5rem', borderRadius: '0', border: '1px solid black' }}>Weekend</span>
        </div>
      </div>

      <div className="calendar-grid" style={{ border: '1px solid black' }}>
        <div className="calendar-weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f7fafc' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'black', borderRight: '1px solid black' }}>
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty" style={{ minHeight: '100px', padding: '0.5rem', borderRight: '1px solid black', borderBottom: '1px solid black', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} />
          ))}

          {calendarData.map((day) => {
            const date = new Date(day.date);
            const dayOfMonth = date.getDate();
            const presentCount = Object.values(day.attendances).filter((a: any) => a.present).length;
            const totalCount = Object.values(day.attendances).length;

            return (
              <div 
                key={day.date} 
                className={getDayClass(day)} 
                style={{ 
                  minHeight: '100px', 
                  padding: '0.5rem', 
                  borderRight: '1px solid black', 
                  borderBottom: '1px solid black', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: day.date === new Date().toISOString().split('T')[0] ? '#e6f3ff' : 'white'
                }}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="day-number" style={{ fontWeight: 'bold', color: 'black' }}>{dayOfMonth}</div>
                {day.description && (
                  <div className="day-holiday" style={{ fontSize: '0.7rem', color: '#6b46c1', fontWeight: '600', marginTop: '0.25rem' }}>{day.description}</div>
                )}
                {totalCount > 0 && (
                  <div className="day-attendance" style={{ fontSize: '0.8rem', color: 'black', fontWeight: '600', textAlign: 'center', marginTop: 'auto' }}>
                    <span>{presentCount}/{totalCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDateAttendances.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: 'white', 
          border: '2px solid black',
          borderRadius: '0'
        }}>
          <h3 style={{ color: 'black', marginBottom: '1rem' }}>Attendance Details for Selected Date</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {selectedDateAttendances.map((att, idx) => (
              <li key={idx} style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0', color: 'black' }}>
                {att.username || 'Unknown'}: Check-in {new Date(att.checkinTime).toLocaleTimeString()}, 
                {att.checkoutTime ? `Check-out ${new Date(att.checkoutTime).toLocaleTimeString()}` : 'No Check-out'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}