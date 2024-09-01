import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakStartTime, setBreakStartTime] = useState('');
  const [breakEndTime, setBreakEndTime] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const username = localStorage.getItem('username');

      if (!username) {
        navigate('/');
        return;
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const setCurrentTime = (setTime) => {
    const now = new Date();
    const formattedTime = now.toTimeString().slice(0, 5);
    setTime(formattedTime);
  };

  // add 9 hours to the current Time
  const setCurrentTimePlusNine = (setTime) => {
    const now = new Date();
    now.setHours(now.getHours() + 9); // Sumar 9 horas
    const formattedTime = now.toTimeString().slice(0, 5);
    setTime(formattedTime);
  };
  
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Returns the date in YYYY-MM-DD format
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentDate = getCurrentDate();

    try {
      const response = await axios.post('http://127.0.0.1:5000/create_shift', {
        start_time: startTime,
        end_time: endTime,
        date: currentDate,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to create shift.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center">Dashboard</h2>
          <p className="text-center text-muted">
            Welcome to your dashboard! Here you can create shifts and breaks.
          </p>

          {message && <p className="text-center text-success">{message}</p>}

          <h3>Create a Shift</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Start Time:</label>
              <div className="input-group">
                <input
                  type="time"
                  className="form-control"
                  name="start_time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentTime(setStartTime)}
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <div className="input-group">
                <input
                  type="time"
                  className="form-control"
                  name="end_time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentTimePlusNine(setEndTime)}
                  >
                    +9 Hours
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Create Shift
            </button>
          </form>

          <h3 className="mt-5">Create a Break</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Break Start Time:</label>
              <div className="input-group">
                <input
                  type="time"
                  className="form-control"
                  name="break_start"
                  value={breakStartTime}
                  onChange={(e) => setBreakStartTime(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentTime(setBreakStartTime)}
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Break End Time:</label>
              <div className="input-group">
                <input
                  type="time"
                  className="form-control"
                  name="break_end"
                  value={breakEndTime}
                  onChange={(e) => setBreakEndTime(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentTime(setBreakEndTime)}
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-secondary w-100 mt-3">
              Create Break
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
