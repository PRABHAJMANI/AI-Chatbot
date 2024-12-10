import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Login.css';
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (token) => {
    localStorage.setItem('auth', token);
    toast.success('Login successful');
    navigate('/dashboard'); // Navigate to the dashboard page
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email && password) {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/login', { email, password });
        localStorage.setItem('auth', response.data.access_token);
        toast.success('Login successful');
        navigate('/dashboard');
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.msg || 'An error occurred during login');
      }
    } else {
      toast.error('Please fill all inputs');
    }
  };

  const handleGoogleLogin = () => {
    const auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signIn().then(googleUser => {
      const id_token = googleUser.getAuthResponse().id_token;
      axios.post('http://localhost:3000/api/v1/googleLogin', { token: id_token })
        .then(response => {
          localStorage.setItem('auth', response.data.access_token);
          toast.success('Google Login successful');
          navigate('/dashboard');
        })
        .catch(error => {
          console.error(error);
          toast.error(error.response.data.msg || 'Failed to log in with Google');
        });
    }).catch(error => {
      console.error('Google Sign-In error:', error);
      toast.error('Google Sign-In failed');
    });
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <FaUserCircle size={180} color="#3b5998" aria-hidden="true" />
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <div className="headers" style={{ textAlign: "center" }} >
            <h1>WELCOME!</h1>
            <h3>Please enter your login details</h3>
          </div>
          <form onSubmit={handleLoginSubmit} aria-label="Login Form">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Email" name="email" required />
            <label htmlFor="password">Password</label>
            <div className="pass-input-div">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                required
                aria-required="true"
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={() => { setShowPassword(!showPassword); }}
                  aria-label="Hide password"
                  role="button"
                  tabIndex="0"
                />
              ) : (
                <FaEye
                  onClick={() => { setShowPassword(!showPassword); }}
                  aria-label="Show password"
                  role="button"
                  tabIndex="0"
                />
              )}
            </div>
            <div className="login-center-options">
              <div className="remember-div">
                {/* <input type="checkbox" id="remember-checkbox" /> */}
                {/* <label htmlFor="remember-checkbox">Remember for 30 days</label> */}
              </div>
              <a href="#" className="forgot-pass-link">Forgot password?</a>
            </div>
            <div className="login-center-buttons">
              <button type="submit" aria-label="Log In" style={{ borderRadius: "20px" }}>Log In</button>
              <button type="button" aria-label="Sign In with Google" style={{ borderRadius: "20px" }} onClick={handleGoogleLogin}>
                <FcGoogle size={20} aria-hidden="true" /> Log In with Google
              </button>
            </div>
          </form>
          <p className="login-bottom-p">
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
