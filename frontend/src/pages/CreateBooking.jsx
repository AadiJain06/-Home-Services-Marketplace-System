import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { bookingAPI } from '../api';

function CreateBooking() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    customerId: user?.id || 'customer-1',
    customerName: user?.name || '',
    serviceType: '',
    description: '',
    address: '',
    scheduledTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const serviceTypes = ['plumbing', 'electrical', 'cleaning', 'handyman'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await bookingAPI.create(formData);
      setMessage({ type: 'success', text: 'Booking created successfully!' });
      setFormData({
        customerId: user?.id || 'customer-1',
        customerName: user?.name || '',
        serviceType: '',
        description: '',
        address: '',
        scheduledTime: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to create booking'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2>Create New Booking</h2>
      <div className="card">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Service Type *</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select a service</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the service you need..."
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter service address"
            />
          </div>

          <div className="form-group">
            <label>Scheduled Time (Optional)</label>
            <input
              type="datetime-local"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateBooking;
