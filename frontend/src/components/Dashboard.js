import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakStartTime, setBreakStartTime] = useState('');
  const [breakEndTime, setBreakEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [breakMessage, setBreakMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:5000/check_session', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data.isLoggedIn) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        navigate('/');
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const getUserData = async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    try {
      const response = await axios.get(`http://localhost:5000/user/${username}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error getting user data:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!user) {
      getUserData();
      console.log(user);
    }
  }, [user]);

  const setCurrentTime = (setTime) => {
    const now = new Date();
    const formattedTime = now.toTimeString().slice(0, 5);
    setTime(formattedTime);
  };

  const setCurrentTimePlusMinutes = (setTime, minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const formattedTime = now.toTimeString().slice(0, 5);
    setTime(formattedTime);
  };

  const setCurrentTimePlusHours = (setTime, hours) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    const formattedTime = now.toTimeString().slice(0, 5);
    setTime(formattedTime);
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const handleShiftSubmit = async (event) => {
    event.preventDefault();
    const currentDate = getCurrentDate();
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://127.0.0.1:5000/shift', {
        start_time: startTime,
        end_time: endTime,
        date: currentDate,
        username: user.username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error creating shift:', error);
      setMessage('Failed to create shift.');
    }
  };

  const handleBreakSubmit = async (event) => {
    event.preventDefault();
    const currentDate = getCurrentDate();
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://127.0.0.1:5000/break', {
        start_time: breakStartTime,
        end_time: breakEndTime,
        date: currentDate,
        break_shift: 'yes',
        username: user.username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBreakMessage(response.data.message);
    } catch (error) {
      console.error('Error creating break:', error);
      setBreakMessage('Failed to create break.');
    }
    console.log(user);
  };

  return (
    <div className="container mt-5">
      <Navbar user={user}/>
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center">Dashboard</h2>
          <p className="text-center text-muted">
            Welcome to your dashboard! Here you can create shifts and breaks.
          </p>

          {message && <p className="text-center text-success">{message}</p>}
          {breakMessage && <p className="text-center text-success">{breakMessage}</p>}

          <div className="row">

            <div className="col-md-6">
              <h3>Create a Shift</h3>
              <form onSubmit={handleShiftSubmit}>
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
                        onClick={() => setCurrentTimePlusHours(setEndTime, 9)}
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
            </div>


            <div className="col-md-6">
              <h3>Create a Break</h3>
              <form onSubmit={handleBreakSubmit}>
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
                        onClick={() => setCurrentTimePlusMinutes(setBreakEndTime, 15)}
                      >
                        +15 Minutes
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

          <div className="row">
            <div className="col-md-6">
              <h3>Your Shifts</h3>
              <ul className="list-group">
                {user && user.shifts.map((shift, index) => 
                  shift.break_shift === 'no' ? (
                  <li key={index} className="list-group-item">
                    {shift.date} - {shift.start_time} - {shift.end_time}
                  </li>
                ) : null
                )}
              </ul>
            </div>
            <div className="col-md-6">
              <h3>Your Breaks</h3>
              <ul className="list-group">
                {user && user.shifts.map((breakItem, index) => 
                  breakItem.break_shift === 'yes' ? (
                    <li key={index} className="list-group-item">
                      {breakItem.date} - {breakItem.start_time} - {breakItem.end_time}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
