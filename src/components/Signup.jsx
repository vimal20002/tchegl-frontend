import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      alert('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-6 text-center">Sign Up</h2>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <input type="text" name="address" placeholder="Address" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="mb-4 p-2 w-full border rounded"/>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded w-full">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
