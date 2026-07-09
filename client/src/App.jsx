import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import PatientProfile from './pages/PatientProfile';

function PrivatePage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivatePage><Dashboard /></PrivatePage>} />
          <Route path="/patients" element={<PrivatePage><Patients /></PrivatePage>} />
          <Route path="/patients/:id" element={<PrivatePage><PatientProfile /></PrivatePage>} />
          <Route path="/doctors" element={<PrivatePage><Doctors /></PrivatePage>} />
          <Route path="/appointments" element={<PrivatePage><Appointments /></PrivatePage>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
