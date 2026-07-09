import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const emptyForm = {
  patient: '', doctor: '', appointmentDate: '', appointmentTime: '', reason: '',
};

function StatusBadge({ status }) {
  return <span className={`badge ${status === 'Cancelled' ? 'badge-red' : 'badge-green'}`}>{status}</span>;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients?limit=1000'),
        api.get('/doctors'),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data.patients);
      setDoctors(docRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const todayISO = new Date().toISOString().split('T')[0];

  const openBook = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({
      patient: a.patient._id,
      doctor: a.doctor._id,
      appointmentDate: a.appointmentDate.split('T')[0],
      appointmentTime: a.appointmentTime,
      reason: a.reason,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}`, form);
      } else {
        await api.post('/appointments', form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/appointments/${cancelId}`);
      setCancelId(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <button className="btn btn-primary" onClick={openBook}>+ Book Appointment</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="7" className="empty">No appointments found</td></tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div>{a.patient?.fullName}</div>
                      <small className="text-muted">{a.patient?.patientId}</small>
                    </td>
                    <td>
                      <div>{a.doctor?.name}</div>
                      <small className="text-muted">{a.doctor?.department}</small>
                    </td>
                    <td>{fmtDate(a.appointmentDate)}</td>
                    <td>{a.appointmentTime}</td>
                    <td className="reason-cell">{a.reason}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="actions">
                      {a.status !== 'Cancelled' && (
                        <>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(a)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setCancelId(a._id)}>Cancel</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Appointment' : 'Book Appointment'} onClose={() => setShowModal(false)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Patient *</label>
              <select value={form.patient} onChange={f('patient')} required>
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.fullName} ({p.patientId})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Doctor *</label>
              <select value={form.doctor} onChange={f('doctor')} required>
                <option value="">Select doctor…</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} — {d.department}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={form.appointmentDate} onChange={f('appointmentDate')} min={todayISO} required />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input type="time" value={form.appointmentTime} onChange={f('appointmentTime')} required />
            </div>
            <div className="form-group form-group--full">
              <label>Reason *</label>
              <textarea value={form.reason} onChange={f('reason')} rows={2} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Book'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {cancelId && (
        <Modal title="Cancel Appointment" onClose={() => setCancelId(null)}>
          <p>Are you sure you want to cancel this appointment?</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setCancelId(null)}>Go Back</button>
            <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
