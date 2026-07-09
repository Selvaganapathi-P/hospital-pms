import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/patients', label: 'Patients' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/appointments', label: 'Appointments' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">HMS</Link>
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>

      <div className={`navbar-content ${menuOpen ? 'open' : ''}`}>
        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <span className="nav-user">{user?.name}</span>
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
