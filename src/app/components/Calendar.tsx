// src/app/components/Calendar.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";
import type { CalendarDay, User } from "../types";

interface CalendarProps {
  month: number;
  year: number;
  users: User[];
}

export default function Calendar({ month, year, users }: CalendarProps) {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const daysInMonth = new Date(year, month, 0).getDate(); // This gets days in the specified month
      const calendarDays: CalendarDay[] = [];

      // Start from day 1 and go to the last day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day); // month - 1 because JS months are 0-indexed
        
        // Set the time to noon to avoid timezone issues
        date.setHours(12, 0, 0, 0);
        
        const dateStr = date.toISOString().split("T")[0];

        // Make sure we're only processing dates for the correct month
        if (date.getMonth() !== month - 1) {
          continue; // Skip if somehow we get a different month
        }

        // Find holiday by comparing date strings (YYYY-MM-DD format)
        const holidayInfo = currentYearHolidays.find((h: any) => {
          const holidayDate = new Date(h.date);
          // Compare using local date strings to avoid timezone issues
          return holidayDate.getUTCFullYear() === date.getFullYear() &&
                 holidayDate.getUTCMonth() === date.getMonth() &&
                 holidayDate.getUTCDate() === date.getDate();
        });
        
        const isHoliday = !!holidayInfo;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // Process attendances
        const attendances: { [key: string]: any } = {};

        users.forEach((user) => {
          const dayAttendance = user.attendances.find((att) => {
            const attDate = new Date(att.date);
            // Compare dates properly
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

  const getDayClass = (day: CalendarDay) => {
    let classes = "calendar-day";

    if (day.isHoliday) classes += " holiday";
    if (day.isWeekend) classes += " weekend";

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

  // Get the first day of the month to determine starting position
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>
          {new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="calendar-legend">
          <span className="legend-item all-present">All Present</span>
          <span className="legend-item mostly-present">Mostly Present</span>
          <span className="legend-item some-present">Some Present</span>
          <span className="legend-item mostly-absent">Mostly Absent</span>
          <span className="legend-item holiday">Holiday</span>
          <span className="legend-item weekend">Weekend</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="calendar-days">
          {/* Add empty cells for days before month starts */}
          {Array.from(
            { length: firstDayOfMonth },
            (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty">
                {/* Empty cell - no content */}
              </div>
            )
          )}

          {calendarData.map((day) => {
            const date = new Date(day.date);
            const dayOfMonth = date.getDate();
            const presentCount = Object.values(day.attendances).filter(
              (a) => a.present
            ).length;
            const totalCount = Object.values(day.attendances).length;

            return (
              <div key={day.date} className={getDayClass(day)}>
                <div className="day-number">{dayOfMonth}</div>
                {day.description && (
                  <div className="day-holiday">{day.description}</div>
                )}
                {totalCount > 0 && (
                  <div className="day-attendance">
                    <span>
                      {presentCount}/{totalCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}