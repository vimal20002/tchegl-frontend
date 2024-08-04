import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import LandingPage from './components/LandingPage';
import CartPage from './components/CartPage';
import UserOrders from './components/UserOrders';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  return (
    <Router>
      <Navbar/>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setToken={setToken} setUserId={setUserId} />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<UserOrders userId={userId} token={token} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
