import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
  const { setIsLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true)
      navigate('/'); 
      
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-6 text-center">Login</h2>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded w-full">Login</button>
      </form>
    </div>
  );
};

export default Login;
