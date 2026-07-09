import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const DEPARTMENTS = ['Cardiology', 'Orthopaedics', 'Neurology', 'General Medicine', 'Pediatrics'];

const emptyForm = {
  name: '', department: '', qualification: '', experience: '', consultationFee: '', mobile: '',
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/doctors?search=${search}`);
      setDoctors(data);
    } catch {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditingId(d._id);
    setForm({
      name: d.name,
      department: d.department,
      qualification: d.qualification,
      experience: String(d.experience),
      consultationFee: String(d.consultationFee),
      mobile: d.mobile,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      ...form,
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
    };
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, payload);
      } else {
        await api.post('/doctors', payload);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/doctors/${deleteId}`);
      setDeleteId(null);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Doctors <span className="badge">{doctors.length}</span></h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Fee (₹)</th>
                <th>Mobile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr><td colSpan="7" className="empty">No doctors found</td></tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d._id}>
                    <td><strong>{d.name}</strong></td>
                    <td><span className="badge badge-green">{d.department}</span></td>
                    <td>{d.qualification}</td>
                    <td>{d.experience} yrs</td>
                    <td>₹{d.consultationFee}</td>
                    <td>{d.mobile}</td>
                    <td className="actions">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(d._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setShowModal(false)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={f('name')} required />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select value={form.department} onChange={f('department')} required>
                <option value="">Select…</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Qualification *</label>
              <input value={form.qualification} onChange={f('qualification')} placeholder="MBBS, MD, etc." required />
            </div>
            <div className="form-group">
              <label>Experience (years) *</label>
              <input type="number" min="0" value={form.experience} onChange={f('experience')} required />
            </div>
            <div className="form-group">
              <label>Consultation Fee (₹) *</label>
              <input type="number" min="0" value={form.consultationFee} onChange={f('consultationFee')} required />
            </div>
            <div className="form-group">
              <label>Mobile (10 digits) *</label>
              <input value={form.mobile} onChange={f('mobile')} pattern="\d{10}" required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Doctor'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p>Delete this doctor? This cannot be undone.</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
