import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = {
  fullName: '', gender: '', dob: '', phone: '', email: '', bloodGroup: '', address: '',
};

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/patients?search=${search}&page=${page}&limit=10`);
      setPatients(data.patients);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // reset to page 1 on new search
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      fullName: p.fullName,
      gender: p.gender,
      dob: p.dob ? p.dob.split('T')[0] : '',
      phone: p.phone,
      email: p.email,
      bloodGroup: p.bloodGroup,
      address: p.address,
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
        await api.put(`/patients/${editingId}`, form);
      } else {
        await api.post('/patients', form);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/patients/${deleteId}`);
      setDeleteId(null);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Patients <span className="badge">{total}</span></h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
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
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan="6" className="empty">No patients found</td></tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p._id}>
                      <td><span className="badge badge-blue">{p.patientId}</span></td>
                      <td>
                        <button className="link-btn" onClick={() => navigate(`/patients/${p._id}`)}>
                          {p.fullName}
                        </button>
                      </td>
                      <td>{p.gender}</td>
                      <td>{p.bloodGroup}</td>
                      <td>{p.phone}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(p._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Patient' : 'Add Patient'} onClose={() => setShowModal(false)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.fullName} onChange={f('fullName')} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select value={form.gender} onChange={f('gender')} required>
                <option value="">Select…</option>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" value={form.dob} onChange={f('dob')} max={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label>Phone (10 digits) *</label>
              <input value={form.phone} onChange={f('phone')} pattern="\d{10}" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={f('email')} required />
            </div>
            <div className="form-group">
              <label>Blood Group *</label>
              <select value={form.bloodGroup} onChange={f('bloodGroup')} required>
                <option value="">Select…</option>
                {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group form-group--full">
              <label>Address *</label>
              <textarea value={form.address} onChange={f('address')} rows={2} required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Patient'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p>Are you sure you want to delete this patient? This cannot be undone.</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
