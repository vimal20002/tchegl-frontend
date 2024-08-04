import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fetchCustomerData = async () => {
  const { data } = await axios.get('http://localhost:5000/api/customers/me', {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return data;
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { data: customer, error, isLoading } = useQuery({
    queryKey: ['customer'],
    queryFn: fetchCustomerData
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    if (error.response?.status === 401) {
      navigate('/login');
      return;
    }
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Customer Dashboard</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Welcome, {customer.name}</h2>
        <p>Email: {customer.email}</p>
        <p>Phone: {customer.phone}</p>
        <p>Address: {customer.address}</p>
      </div>
    </div>
  );
};

export default CustomerDashboard;
