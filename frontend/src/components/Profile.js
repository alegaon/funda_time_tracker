import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/check_session', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            if (!response.data.isLoggedIn) {
                navigate('/');
            }
        }
        catch (error) {
            console.error('Error checking login status:', error);
            navigate('/');
        }
    }
    checkLoginStatus();
    }
    , [navigate]);

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
        }
        catch (error) {
            console.error('Error getting user data:', error);
            setUser(null);
        }
    }
    useEffect(() => {
        if (!user) {
            getUserData();
        }
    }
    , [user]);

    return (
        <div className="container">
            <Navbar user={user}/>
            <div className="card">
                <div className="card-body">
                  <div className="row justify-content-center">
                    <div className="col-md-6">
                        <h2 className="text-center mb-4">User Profile</h2>
                        {user ? (
                            <div>
                                <p><strong>Username:</strong> {user.username}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Created:</strong> {user.created}</p>
                                <p><strong>Last Login:</strong> {user.last_login}</p>
                            </div>
                        ) : (
                            <p>Loading user data...</p>
                        )}
                    </div>
                  </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;