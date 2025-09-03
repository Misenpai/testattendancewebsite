// src/app/components/StatsCards.tsx
import type { ApiResponse } from '../types';

interface StatsCardsProps {
  data: ApiResponse | null;
}

export default function StatsCards({ data }: StatsCardsProps) {
  if (!data) {
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>On Field Trip</h3>
          <div className="stat-value">0</div>
        </div>
      </div>
    );
  }

  const presentToday = data.data.filter(u => 
    u.attendances.some(a => {
      const today = new Date().toDateString();
      const attDate = new Date(a.date).toDateString();
      return today === attDate && a.isCheckedOut !== false;
    })
  ).length;

  const onFieldTrip = data.data.filter(u => u.hasActiveFieldTrip).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Users</h3>
        <div className="stat-value">{data.totalUsers}</div>
        <div className="stat-subtitle">Under your projects</div>
      </div>
      <div className="stat-card">
        <h3>Present Today</h3>
        <div className="stat-value">{presentToday}</div>
        <div className="stat-subtitle">Checked in</div>
      </div>
      <div className="stat-card">
        <h3>On Field Trip</h3>
        <div className="stat-value">{onFieldTrip}</div>
        <div className="stat-subtitle">Currently active</div>
      </div>
      <div className="stat-card">
        <h3>This Month</h3>
        <div className="stat-value">{data.month}/{data.year}</div>
        <div className="stat-subtitle">Viewing period</div>
      </div>
    </div>
  );
}