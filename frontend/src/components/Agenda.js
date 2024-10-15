import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';



const Agenda = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="container">
      <Navbar user={user}/>
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-12">
              <h3>Agenda</h3>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}


export default Agenda;