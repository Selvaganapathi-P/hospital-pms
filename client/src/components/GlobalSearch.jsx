import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setOpen(true);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path) => {
    setQuery('');
    setResults(null);
    setOpen(false);
    navigate(path);
  };

  const hasResults = results && (results.patients.length > 0 || results.doctors.length > 0);

  return (
    <div className="global-search" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search patients, doctors…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
        className="search-input"
      />
      {loading && <span className="search-spinner">…</span>}

      {open && hasResults && (
        <div className="search-dropdown">
          {results.patients.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">Patients</div>
              {results.patients.map((p) => (
                <div key={p._id} className="search-item" onClick={() => go(`/patients/${p._id}`)}>
                  <strong>{p.fullName}</strong>
                  <span className="search-sub">{p.patientId} · {p.bloodGroup}</span>
                </div>
              ))}
            </div>
          )}
          {results.doctors.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">Doctors</div>
              {results.doctors.map((d) => (
                <div key={d._id} className="search-item" onClick={() => go(`/doctors`)}>
                  <strong>{d.name}</strong>
                  <span className="search-sub">{d.department}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {open && results && !hasResults && (
        <div className="search-dropdown">
          <div className="search-empty">No results for "{query}"</div>
        </div>
      )}
    </div>
  );
}
