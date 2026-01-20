import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const USERS = {
  customers: [
    { id: 'customer-1', name: 'Arjun Singh', type: 'customer', email: 'arjun.singh@example.com' },
    { id: 'customer-2', name: 'Kavita Reddy', type: 'customer', email: 'kavita.reddy@example.com' },
    { id: 'customer-3', name: 'Vikram Mehta', type: 'customer', email: 'vikram.mehta@example.com' }
  ],
  providers: [
    { id: 'provider-1', name: 'Rajesh Kumar', type: 'provider', email: 'rajesh.kumar@example.com' },
    { id: 'provider-2', name: 'Priya Sharma', type: 'provider', email: 'priya.sharma@example.com' },
    { id: 'provider-3', name: 'Amit Patel', type: 'provider', email: 'amit.patel@example.com' }
  ],
  admin: [
    { id: 'admin-1', name: 'Admin User', type: 'admin', email: 'admin@example.com' }
  ]
};

function Login() {
  const [selectedUser, setSelectedUser] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    const allUsers = [...USERS.customers, ...USERS.providers, ...USERS.admin];
    const user = allUsers.find(u => u.id === selectedUser);
    
    if (user) {
      login(user);
      
      // Navigate based on user type
      if (user.type === 'admin') {
        navigate('/admin');
      } else if (user.type === 'provider') {
        navigate('/provider');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <div className="card">
        <h2>Login to Home Services Marketplace</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Select a user to continue
        </p>

        <div className="form-group">
          <label>Select User *</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ fontSize: '16px', padding: '12px' }}
          >
            <option value="">Choose a user...</option>
            <optgroup label="Customers">
              {USERS.customers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (Customer)
                </option>
              ))}
            </optgroup>
            <optgroup label="Providers">
              {USERS.providers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (Provider)
                </option>
              ))}
            </optgroup>
            <optgroup label="Admin">
              {USERS.admin.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (Admin)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={!selectedUser}
          style={{ width: '100%', fontSize: '16px', padding: '12px' }}
        >
          Login
        </button>
      </div>

      <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Demo Users:</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <p><strong>Customers:</strong> Arjun Singh, Kavita Reddy, Vikram Mehta</p>
          <p><strong>Providers:</strong> Rajesh Kumar, Priya Sharma, Amit Patel</p>
          <p><strong>Admin:</strong> Admin User</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
