import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { bookingAPI } from '../api';

function ViewBookings() {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getAll({ customerId: user.id });
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (bookingId) => {
    try {
      const response = await bookingAPI.getEvents(bookingId);
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    await loadEvents(booking.id);
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId, user.id, 'customer', 'Customer cancellation');
      await loadBookings();
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
        setEvents([]);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel booking');
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
      <h2>My Bookings</h2>

      <div className="card">
        <div className="form-group">
          <label>Filter by Status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="booking-list">
        {filteredBookings.length === 0 ? (
          <div className="card">
            <p>No bookings found.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-item">
              <h3>{booking.service_type.charAt(0).toUpperCase() + booking.service_type.slice(1)}</h3>
              <p><strong>Status:</strong> <span className={`status-badge status-${booking.status}`}>{booking.status}</span></p>
              <p><strong>Address:</strong> {booking.address}</p>
              {booking.provider_id && <p><strong>Provider ID:</strong> {booking.provider_id}</p>}
              {booking.scheduled_time && <p><strong>Scheduled:</strong> {new Date(booking.scheduled_time).toLocaleString()}</p>}
              <p><strong>Created:</strong> {new Date(booking.created_at).toLocaleString()}</p>

              <div className="booking-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleViewDetails(booking)}
                >
                  View Details & History
                </button>
                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBooking && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Booking Details & Event History</h3>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
            <p><strong>Description:</strong> {selectedBooking.description || 'N/A'}</p>
            {selectedBooking.cancellation_reason && (
              <p><strong>Cancellation Reason:</strong> {selectedBooking.cancellation_reason}</p>
            )}
          </div>

          <h4>Event History</h4>
          <div className="event-log">
            {events.length === 0 ? (
              <p>No events recorded.</p>
            ) : (
              events.map(event => {
                const eventData = JSON.parse(event.event_data || '{}');
                return (
                  <div key={event.id} className="event-item">
                    <strong>{event.event_type.replace('_', ' ').toUpperCase()}</strong>
                    {eventData.from && eventData.to && (
                      <div>Status: {eventData.from} → {eventData.to}</div>
                    )}
                    <small>
                      By: {event.performed_by} ({event.performed_by_type}) | 
                      {new Date(event.created_at).toLocaleString()}
                    </small>
                  </div>
                );
              })
            )}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setSelectedBooking(null);
              setEvents([]);
            }}
            style={{ marginTop: '16px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default ViewBookings;
