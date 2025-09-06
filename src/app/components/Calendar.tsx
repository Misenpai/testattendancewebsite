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
      if (holidaysRes.success) {
        setHolidays(holidaysRes.holidays);
      }

      // Generate calendar days
      const daysInMonth = new Date(year, month, 0).getDate();
      const calendarDays: CalendarDay[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dateStr = date.toISOString().split("T")[0];

        const isHoliday = holidays.some(
          (h) => new Date(h.date).toDateString() === date.toDateString()
        );

        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        const attendances: { [key: string]: any } = {};

        // In the loadCalendarData function, update the attendance logic:
        users.forEach((user) => {
          const dayAttendance = user.attendances.find((att) => {
            const attDate = new Date(att.date).toDateString();
            return attDate === date.toDateString();
          });

          if (dayAttendance) {
            // Record exists = present
            attendances[user.employeeNumber] = {
              present: true,
              type:
                dayAttendance.attendanceType === "FULL_DAY"
                  ? "FULL_DAY"
                  : dayAttendance.attendanceType === "HALF_DAY"
                  ? "HALF_DAY"
                  : "IN_PROGRESS", // No checkoutTime means in progress
              username: user.username,
            };
          } else if (!isHoliday && !isWeekend) {
            // No record on working day = absent
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
          description: holidays.find(
            (h) => new Date(h.date).toDateString() === date.toDateString()
          )?.description,
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
          {calendarData.map((day, index) => {
            const date = new Date(day.date);
            const dayOfMonth = date.getDate();
            const presentCount = Object.values(day.attendances).filter(
              (a) => a.present
            ).length;
            const totalCount = Object.values(day.attendances).length;

            return (
              <div key={index} className={getDayClass(day)}>
                <div className="day-number">{dayOfMonth}</div>
                {day.description && (
                  <div className="day-holiday">{day.description}</div>
                )}
                <div className="day-attendance">
                  {totalCount > 0 && (
                    <span>
                      {presentCount}/{totalCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
