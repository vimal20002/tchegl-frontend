import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const { isLoggedIn, role, setIsLoggedIn, setRole } = useAuth();
  const [loginFlag, setLoginFlag] = useState(false)
  const [roleVal, setRoleVal] = useState("")
  useEffect(()=>{
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    setRoleVal(role)
    setLoginFlag(token!=null)
  },[])
  useEffect(()=>{
    if(isLoggedIn)
setLoginFlag(isLoggedIn)
  },[isLoggedIn])
  useEffect(()=>{
    if(role!='')
setRoleVal(role)
  },[role])
  const navigate = useNavigate()
  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('user');
    setLoginFlag(false)
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login')
  };
  useEffect(()=>{
    console.log(loginFlag)
  },[loginFlag])

  return (
    <nav className="bg-blue-600 p-4">
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
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded ml-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
        {loginFlag && roleVal === 'user' && (
          <Link to={'/'}>
          <button 
            onClick={() => {setRole('manager');localStorage.setItem('role',"manager")}}
            className="bg-green-500 text-white py-2 px-4 rounded ml-2"
            >
            Switch to Manager
          </button>
            </Link>
        )}
        {loginFlag && roleVal === 'manager' && (
          <Link to={'/'}>
          <button 
            onClick={() => {setRole('user');localStorage.setItem('role',"user")}}
            className="bg-green-500 text-white py-2 px-4 rounded ml-2"
            >
            Switch to User
          </button>
            </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
