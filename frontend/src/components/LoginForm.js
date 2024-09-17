import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the username in localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.token);

        // Show a success message
        setMessage('Login successful!');

        // Redirect to dashboard or home
        navigate('/dashboard');
      } else {
        // Display an error message
        setMessage(data.message || 'Login failed. Please try again.');
        // Show the registration link if login fails
        setShowRegisterLink(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('An error occurred during login. Please try again.');
    }
  };

  return (
<div className="container">
  <div className="row justify-content-center">
    <div className="col-md-6 col-lg-4">
      <h2 className="text-center my-4">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            id="username"
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      {message && <p className="text-danger mt-3">{message}</p>}
      {showRegisterLink && (
        <p className="mt-3">
          Don't have an account? <Link to="/register">Register here</Link>.
        </p>
      )}
    </div>
  </div>
</div>

  );
}

export default LoginForm;
