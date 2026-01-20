import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Login from './pages/Login';
import CreateBooking from './pages/CreateBooking';
import ViewBookings from './pages/ViewBookings';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminPanel from './pages/AdminPanel';

function ProtectedRoute({ children, allowedTypes }) {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  const { user, logout } = useUser();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div>
      <header className="header">
        <h1>Home Services Marketplace</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <nav className="nav">
            {user.type === 'customer' && (
              <>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                  Create Booking
                </Link>
                <Link to="/bookings" className={location.pathname === '/bookings' ? 'active' : ''}>
                  My Bookings
                </Link>
              </>
            )}
            {user.type === 'provider' && (
              <Link to="/provider" className={location.pathname === '/provider' ? 'active' : ''}>
                Provider Dashboard
              </Link>
            )}
            {user.type === 'admin' && (
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                Admin Panel
              </Link>
            )}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>
              Logged in as: <strong>{user.name}</strong> ({user.type})
            </span>
            <button
              onClick={logout}
              className="btn"
              style={{ background: '#e74c3c', fontSize: '12px', padding: '6px 12px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedTypes={['customer']}>
                <CreateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedTypes={['customer']}>
                <ViewBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedTypes={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
