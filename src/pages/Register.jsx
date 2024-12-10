import React, { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaUserCircle } from 'react-icons/fa';
import '../styles/Register.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState(null);
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('auth') || '');

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$&*])[A-Za-z\d!@#$&*]{8,}$/;

    if (name.trim() && lastname.trim() && email.trim() && dob && password.trim() && confirmPassword.trim()) {
      if (calculateAge(dob) < 18) {
        toast.error('You must be at least 18 years old to register.');
        return;
      }

      if (!passwordRegex.test(password)) {
        toast.error(
          'Password is weak. It must be at least 8 characters long, contain lower case characters, upper case characters, numbers, and one special character from !@#$&*.'
        );
        return;
      }

      if (password.toLowerCase().includes(name.toLowerCase()) || password.toLowerCase().includes(lastname.toLowerCase())) {
        toast.error("Password shouldn't contain your name or last name.");
        return;
      }

      if (password === confirmPassword) {
        const formData = {
          username: name.trim() + ' ' + lastname.trim(),
          email: email.trim(),
          password: password.trim(),
          dob,
        };
        try {
          const response = await axios.post('http://localhost:3000/api/v1/register', formData);
          toast.success('Registration successful. Please check your email to verify your account.');
          navigate('/login');
        } catch (err) {
          toast.error(err.message);
        }
      } else {
        toast.error("Passwords don't match");
      }
    } else {
      toast.error('Please fill all inputs');
    }
  };

  useEffect(() => {
    if (token.trim()) {
      toast.success('You are already logged in');
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className='register-main'>
      <div className='register-left'>
        <FaUserCircle size={180} color='#3b5998' aria-hidden='true' />
      </div>
      <div className='register-right'>
        <div className='register-form-container'>
          <div className='headers'>
            <h1>WELCOME TO AI-INTERVIEW AGENT!</h1>
            <h3>Please enter your login details</h3>
          </div>
          <form onSubmit={handleRegisterSubmit} aria-label='Registration Form'>
            <label htmlFor='name'>First Name</label>
            <input id='name' type='text' placeholder='First Name' name='name' value={name} onChange={(e) => setName(e.target.value)} required />
            <label htmlFor='lastname'>Last Name</label>
            <input id='lastname' type='text' placeholder='Last Name' name='lastname' value={lastname} onChange={(e) => setLastname(e.target.value)} required />
            <label htmlFor='email'>Email</label>
            <input id='email' type='email' placeholder='Email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label htmlFor='dob'>Date of Birth</label>
            <DatePicker
              id='dob'
              selected={dob}
              onChange={(date) => setDob(date)}
              dateFormat='yyyy-MM-dd'
              placeholderText='Date of Birth'
              className='dob-input'
              required
              aria-required='true'
            />
            <label htmlFor='password'>Password</label>
            <div className='pass-input-div'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required='true'
              />
              {showPassword ? (
                <FaEyeSlash onClick={() => setShowPassword(!showPassword)} aria-label='Hide password' role='button' tabIndex='0' />
              ) : (
                <FaEye onClick={() => setShowPassword(!showPassword)} aria-label='Show password' role='button' tabIndex='0' />
              )}
            </div>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <div className='pass-input-div'>
              <input
                id='confirmPassword'
                type={showPassword ? 'text' : 'password'}
                placeholder='Confirm Password'
                name='confirmPassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required='true'
              />
              {showPassword ? (
                <FaEyeSlash onClick={() => setShowPassword(!showPassword)} aria-label='Hide confirm password' role='button' tabIndex='0' />
              ) : (
                <FaEye onClick={() => setShowPassword(!showPassword)} aria-label='Show confirm password' role='button' tabIndex='0' />
              )}
            </div>
            <div className='register-center-buttons'>
              <button type='submit' aria-label='Register' style={{ borderRadius: '20px' }}>
                Register
              </button>
            </div>
          </form>
          <p className='register-bottom-p'>
            Already have an account? <Link to='/login'>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
