import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { bookingAPI } from '../api';

function ProviderDashboard() {
  const { user } = useUser();
  const providerId = user?.id;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (providerId) {
      loadBookings();
    }
  }, [providerId]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAll({ providerId });
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await bookingAPI.accept(bookingId, providerId);
      await loadBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept booking');
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }

    try {
      await bookingAPI.reject(bookingId, providerId);
      await loadBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject booking');
    }
  };

  const handleStart = async (bookingId) => {
    try {
      await bookingAPI.updateStatus(bookingId, 'in-progress', providerId, 'provider');
      await loadBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start booking');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await bookingAPI.updateStatus(bookingId, 'completed', providerId, 'provider');
      await loadBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to complete booking');
    }
  };

  const filteredBookings = filter
    ? bookings.filter(b => b.status === filter)
    : bookings;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Provider Dashboard</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Welcome, <strong>{user?.name}</strong>
      </p>

      <div className="card">
        <div className="form-group">
          <label>Filter by Status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="booking-list">
        {filteredBookings.length === 0 ? (
          <div className="card">
            <p>No bookings assigned to this provider.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-item">
              <h3>{booking.service_type.charAt(0).toUpperCase() + booking.service_type.slice(1)}</h3>
              <p><strong>Status:</strong> <span className={`status-badge status-${booking.status}`}>{booking.status}</span></p>
              <p><strong>Customer:</strong> {booking.customer_name}</p>
              <p><strong>Address:</strong> {booking.address}</p>
              {booking.description && <p><strong>Description:</strong> {booking.description}</p>}
              {booking.scheduled_time && <p><strong>Scheduled:</strong> {new Date(booking.scheduled_time).toLocaleString()}</p>}

              <div className="booking-actions">
                {booking.status === 'assigned' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleAccept(booking.id)}
                    >
                      Accept & Start
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(booking.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {booking.status === 'in-progress' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleComplete(booking.id)}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProviderDashboard;
