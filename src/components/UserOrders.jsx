import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

// Define an SVG for no orders
const NoOrdersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-24 h-24 mx-auto text-gray-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);

// Fetch orders
const fetchUserOrders = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const { data } = await axios.get('https://tchegl-backend.onrender.com/api/orders/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Fetched orders:', data); // Debugging
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error); // Debugging
    throw error;
  }
};

// Fetch product details by ID
const fetchProductById = async (productId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const { data } = await axios.get(`https://tchegl-backend.onrender.com/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Fetched product:', data); // Debugging
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error); // Debugging
    throw error;
  }
};

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersData = await fetchUserOrders();
        setOrders(ordersData);

        const productIds = [...new Set(ordersData.flatMap(order => order.items.map(item => item.productId)))];
        console.log('Product IDs:', productIds); // Debugging
        fetchProducts(productIds);
      } catch (err) {
        console.error('Error fetching user orders:', err);
        setError(err);
        if (err.message === "No authentication token found") {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchProducts = async (productIds) => {
    console.log('Fetching products for IDs:', productIds); // Debugging
    try {
      const products = await Promise.all(productIds.map(id => fetchProductById(id)));
      const productsMap = products.reduce((acc, product) => {
        acc[product._id] = product;
        return acc;
      }, {});
      console.log('Fetched products map:', productsMap); // Debugging
      setProductDetails(productsMap);
    } catch (error) {
      console.error('Error fetching product details:', error); // Debugging
    }
  };

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [orders, controls]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">Error loading orders: {error.message}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-center">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center text-gray-600">
          <NoOrdersIcon />
          <p className="mt-4 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <motion.div
              key={order._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-2">Order ID: {order._id}</h3>
              <p className="text-gray-700 mb-2">Status: <span className="font-semibold">{order.status}</span></p>
              <p className="text-gray-700 mb-4">Total: <span className="font-semibold">${order.totalAmount}</span></p>
              <div>
                <h4 className="text-lg font-medium mb-2">Items:</h4>
                <ul className="list-disc list-inside space-y-2">
                  {order.items.map((item) => {
                    const product = productDetails[item.productId];
                    console.log('Item product:', product); // Debugging
                    return (
                      <li key={item._id} className="flex items-center space-x-4">
                        {product ? (
                          <>
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div className="text-gray-800">
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm">Quantity: {item.quantity} pcs</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500">Product details not available</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
