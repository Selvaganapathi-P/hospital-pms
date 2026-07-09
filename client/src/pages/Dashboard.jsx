import { useEffect, useState } from 'react';
import api from '../services/api';

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data'));
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <StatCard label="Total Patients" value={stats?.totalPatients} color="blue" />
        <StatCard label="Total Doctors" value={stats?.totalDoctors} color="green" />
        <StatCard label="Today's Appointments" value={stats?.todayAppointments} color="orange" />
        <StatCard label="Upcoming Appointments" value={stats?.upcomingAppointments} color="purple" />
      </div>
    </div>
  );
}
