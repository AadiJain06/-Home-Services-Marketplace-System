import React, { useState, useEffect } from 'react';
import { bookingAPI, providerAPI, adminAPI } from '../api';

function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [manualProviderId, setManualProviderId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, providersRes, eventsRes] = await Promise.all([
        bookingAPI.getAll(),
        providerAPI.getAll(),
        adminAPI.getEvents()
      ]);
      setBookings(bookingsRes.data);
      setProviders(providersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async (bookingId) => {
    if (!manualProviderId) {
      alert('Please select a provider');
      return;
    }

    try {
      await adminAPI.assignProvider(bookingId, manualProviderId);
      alert('Provider assigned successfully');
      await loadData();
      setManualProviderId('');
      setSelectedBooking(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to assign provider');
    }
  };

  const handleOverrideStatus = async (bookingId) => {
    if (!overrideStatus) {
      alert('Please select a status');
      return;
    }

    try {
      await adminAPI.overrideStatus(bookingId, overrideStatus, overrideReason);
      alert('Status overridden successfully');
      await loadData();
      setOverrideStatus('');
      setOverrideReason('');
      setSelectedBooking(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to override status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Admin Panel</h2>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            All Bookings
          </button>
          <button
            className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('events')}
          >
            Event Logs
          </button>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div>
          <div className="card">
            <h3>All Bookings ({bookings.length})</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.id.substring(0, 8)}...</td>
                    <td>{booking.customer_name}</td>
                    <td>{booking.service_type}</td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{booking.provider_id || 'Unassigned'}</td>
                    <td>{new Date(booking.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedBooking(booking)}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedBooking && (
            <div className="card">
              <h3>Manage Booking: {selectedBooking.id.substring(0, 8)}...</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Customer:</strong> {selectedBooking.customer_name}</p>
                <p><strong>Service:</strong> {selectedBooking.service_type}</p>
                <p><strong>Current Status:</strong> <span className={`status-badge status-${selectedBooking.status}`}>{selectedBooking.status}</span></p>
                <p><strong>Current Provider:</strong> {selectedBooking.provider_id || 'None'}</p>
              </div>

              <div className="form-group">
                <label>Manual Provider Assignment</label>
                <select
                  value={manualProviderId}
                  onChange={(e) => setManualProviderId(e.target.value)}
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.service_types}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={() => handleManualAssign(selectedBooking.id)}
                  style={{ marginTop: '10px' }}
                >
                  Assign Provider
                </button>
              </div>

              <div className="form-group">
                <label>Override Status (Admin Override)</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <input
                  type="text"
                  placeholder="Reason for override (optional)"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  style={{ marginTop: '10px' }}
                />
                <button
                  className="btn btn-warning"
                  onClick={() => handleOverrideStatus(selectedBooking.id)}
                  style={{ marginTop: '10px' }}
                >
                  Override Status
                </button>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedBooking(null);
                  setManualProviderId('');
                  setOverrideStatus('');
                  setOverrideReason('');
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="card">
          <h3>Event Logs ({events.length})</h3>
          <div className="event-log" style={{ maxHeight: '600px' }}>
            {events.length === 0 ? (
              <p>No events recorded.</p>
            ) : (
              events.map(event => {
                const eventData = JSON.parse(event.event_data || '{}');
                return (
                  <div key={event.id} className="event-item">
                    <strong>{event.event_type.replace('_', ' ').toUpperCase()}</strong>
                    <div>Booking: {event.booking_id.substring(0, 8)}...</div>
                    {eventData.from && eventData.to && (
                      <div>Status Change: {eventData.from} → {eventData.to}</div>
                    )}
                    {eventData.providerId && (
                      <div>Provider: {eventData.providerId}</div>
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
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
