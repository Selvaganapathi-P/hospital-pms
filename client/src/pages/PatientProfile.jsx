import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );
}

function AppointmentTable({ appointments, emptyMsg }) {
  if (!appointments.length) return <p className="empty">{emptyMsg}</p>;

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{fmtDate(a.appointmentDate)}</td>
              <td>{a.appointmentTime}</td>
              <td>{a.doctor?.name}</td>
              <td>{a.doctor?.department}</td>
              <td>{a.reason}</td>
              <td>
                <span className={`badge ${a.status === 'Cancelled' ? 'badge-red' : 'badge-green'}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/patients/${id}/appointments`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load patient profile'));
  }, [id]);

  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="page"><div className="loading">Loading…</div></div>;

  const { patient, past, upcoming } = data;
  const age = patient.dob
    ? Math.floor((new Date() - new Date(patient.dob)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/patients" className="back-link">← Patients</Link>
          <h1 className="page-title">{patient.fullName}</h1>
          <span className="badge badge-blue">{patient.patientId}</span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h2 className="card-title">Patient Details</h2>
          <InfoRow label="Gender" value={patient.gender} />
          <InfoRow label="Age" value={age ? `${age} years` : null} />
          <InfoRow label="Date of Birth" value={new Date(patient.dob).toLocaleDateString('en-IN')} />
          <InfoRow label="Blood Group" value={patient.bloodGroup} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="Email" value={patient.email} />
          <InfoRow label="Address" value={patient.address} />
        </div>

        <div>
          <div className="card">
            <h2 className="card-title">Upcoming Appointments <span className="badge">{upcoming.length}</span></h2>
            <AppointmentTable appointments={upcoming} emptyMsg="No upcoming appointments" />
          </div>

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h2 className="card-title">Past Appointments <span className="badge">{past.length}</span></h2>
            <AppointmentTable appointments={past} emptyMsg="No past appointments" />
          </div>
        </div>
      </div>
    </div>
  );
}
