import React, { useEffect, useState } from 'react';
import "../styles/Dashboard.css";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("auth") || "");
  const [userName, setUserName] = useState(""); // State for user's name
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    let axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get("http://localhost:3000/api/v1/dashboard", axiosConfig);
      setUserName(response.data.msg); // Assume 'msg' contains the user's name
      setUserName(response.data.msg); // Assume 'msg' contains the user's name
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchUserData();
    if (token === "") {
      navigate("/login");
      toast.warn("Please login first to access dashboard");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth"); // Remove auth token from local storage
    navigate("/logout");
  };

  const startInterview = (type) => {
    navigate(`/videocall?type=${type}`);
  };

  // Render loading message if loading is true
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='dashboard-main'>
      <h1>Dashboard</h1>
      <p>Welcome {userName}!</p>
      <button onClick={() => startInterview('coding')} className="interview-button">Start Coding Interview</button>
      <button onClick={() => startInterview('system_design')} className="interview-button">Start System Design Interview</button>
      <button onClick={() => startInterview('hr')} className="interview-button">Start HR Interview</button>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Dashboard;