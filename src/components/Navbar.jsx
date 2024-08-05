import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { motion, useAnimation } from 'framer-motion';

const Navbar = () => {
  const { isLoggedIn, role, setIsLoggedIn, setRole } = useAuth();
  const [loginFlag, setLoginFlag] = useState(false);
  const [roleVal, setRoleVal] = useState("");
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    setLoginFlag(!!token);
    setRoleVal(storedRole || "");
  }, [isLoggedIn, role]);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('user');
    setLoginFlag(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    localStorage.setItem('role', newRole);
  };

  return (
    <motion.nav
      className="bg-blue-600 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">Ecommerce</Link>
        <div>
          {!loginFlag ? (
            <>
              <Link to="/signup" className="text-white mr-4">Sign Up</Link>
              <Link to="/login" className="text-white">Login</Link>
            </>
          ) : (
            <>
              {roleVal === 'user' && (
                <>
                  <Link to="/orders" className="text-white mr-4">Orders</Link>
                  <Link to="/cart" className="text-white mr-4">Cart</Link>
                </>
              )}
              {roleVal === 'manager' && (
                <Link to="/manager-dashboard" className="text-white mr-4">Manager Dashboard</Link>
              )}
              <motion.button 
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded ml-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          )}
        </div>
        {loginFlag && (
          roleVal === 'user' ? (
            <motion.button 
              onClick={() => handleRoleSwitch('manager')}
              className="bg-green-500 text-white py-2 px-4 rounded ml-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Switch to Manager
            </motion.button>
          ) : (
            roleVal === 'manager' && (
              <motion.button 
                onClick={() => handleRoleSwitch('user')}
                className="bg-green-500 text-white py-2 px-4 rounded ml-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Switch to User
              </motion.button>
            )
          )
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
