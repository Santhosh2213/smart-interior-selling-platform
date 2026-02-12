import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  // Test Basic Server Connection
  const testServerConnection = async () => {
    try {
      setServerStatus('Connecting...');
      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      setServerStatus('✅ Connected');
      setApiResponse(data);
      setError(null);
    } catch (err) {
      setServerStatus('❌ Failed');
      setError(err.message);
      console.error('Connection Error:', err);
    }
  };

  // Test Database Connection
  const testDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test/db');
      const data = await response.json();
      alert(`Database: ${data.message}`);
    } catch (err) {
      alert(`Database Error: ${err.message}`);
    }
  };

  // Test Fixed Seller Login
  const testSellerLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test/seller-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'seller@example.com',
          password: 'seller123'
        })
      });
      const data = await response.json();
      alert(data.success ? '✅ Seller Login Success' : '❌ Login Failed');
    } catch (err) {
      alert(`Login Error: ${err.message}`);
    }
  };

  // Test Fixed Designer Login
  const testDesignerLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test/designer-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'designer@example.com',
          password: 'designer123'
        })
      });
      const data = await response.json();
      alert(data.success ? '✅ Designer Login Success' : '❌ Login Failed');
    } catch (err) {
      alert(`Login Error: ${err.message}`);
    }
  };

  // Test Customer Registration
  const testCustomerRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test/customer-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Customer',
          email: `test${Date.now()}@example.com`,
          phone: '9876543210',
          password: 'customer123'
        })
      });
      const data = await response.json();
      alert(data.success ? '✅ Customer Registered' : '❌ Registration Failed');
    } catch (err) {
      alert(`Registration Error: ${err.message}`);
    }
  };

  // Test on component mount
  useEffect(() => {
    testServerConnection();
  }, []);

  return (
    <div className="App">
      <h1>🚀 Smart Seller Platform</h1>
      <h2>Server Connection Test</h2>
      
      <div className="status-card">
        <h3>Server Status: <span className={serverStatus.includes('✅') ? 'success' : 'error'}>{serverStatus}</span></h3>
        {apiResponse && (
          <div className="response">
            <p>📡 Server Response:</p>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div className="error">
            <p>❌ Error: {error}</p>
          </div>
        )}
      </div>

      <div className="button-container">
        <button onClick={testServerConnection} className="btn">
          🔄 Refresh Connection
        </button>
        <button onClick={testDatabase} className="btn">
          🗄️ Test Database
        </button>
        <button onClick={testSellerLogin} className="btn seller">
          👤 Test Seller Login
        </button>
        <button onClick={testDesignerLogin} className="btn designer">
          🎨 Test Designer Login
        </button>
        <button onClick={testCustomerRegister} className="btn customer">
          👥 Test Customer Register
        </button>
      </div>

      <div className="info">
        <h4>📋 Fixed Credentials:</h4>
        <p><strong>Seller:</strong> seller@example.com / seller123</p>
        <p><strong>Designer:</strong> designer@example.com / designer123</p>
        <p><strong>API URL:</strong> http://localhost:5000</p>
      </div>
    </div>
  );
}

export default App;