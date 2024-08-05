import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('https://tchegl-backend.onrender.com/api/users/register', formData);
      alert('User registered successfully');
      setLoading(false);
      navigate('/login')
    } catch (error) {
      console.error('Error registering user:', error);
      setError('Error registering user. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center h-screen"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <motion.input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
          className="mb-4 p-2 w-full border rounded"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="mb-4 p-2 w-full border rounded"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          required
          className="mb-4 p-2 w-full border rounded"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.input
          type="text"
          name="address"
          placeholder="Address"
          onChange={handleChange}
          required
          className="mb-4 p-2 w-full border rounded"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="mb-4 p-2 w-full border rounded"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded w-full"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default Signup;
