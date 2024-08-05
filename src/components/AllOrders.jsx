import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// SVG Components
const NoOrdersSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v18H3V3zM2 2h20v20H2V2zm4 6h12v2H6V8zm0 4h12v2H6v-2zm0 4h12v2H6v-2z"/>
  </svg>
);

const NoProductsSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 6h14M5 12h14M5 18h14M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>
  </svg>
);

// Fetch orders
const fetchOrders = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");
  const { data } = await axios.get('https://tchegl-backend.onrender.com/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

// Fetch product details
const fetchProductDetails = async (productId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");
  const { data } = await axios.get(`https://tchegl-backend.onrender.com/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

// Custom hook for products
const useProducts = (productIds) => {
  return useQuery({
    queryKey: ['products', productIds],
    queryFn: async () => {
      const productDetails = await Promise.all(productIds.map(id => fetchProductDetails(id)));
      return productDetails;
    },
    enabled: productIds.length > 0
  });
};

const AllOrders = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/login');
    }
  }, [navigate]);

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        navigate('/login');
      }
    }
  });

  useEffect(() => {
    if (orders.length > 0) {
      const ids = orders.flatMap(order => order.items.map(item => item.productId));
      setProductIds([...new Set(ids)]);
    }
  }, [orders]);

  const { data: products = [], isLoading: productsLoading, isError: productsError, error: productsFetchError } = useProducts(productIds);

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
      await axios.put(`https://tchegl-backend.onrender.com/api/orders/status/${orderId}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      alert(`Error updating order status: ${error.message}`);
    }
  });

  const handleStatusChange = (orderId, status) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  if (isLoading || productsLoading) return <p className="text-center mt-4">Loading...</p>;
  if (isError || productsError) return <p className="text-center mt-4">Error loading data: {error?.message || productsFetchError?.message}</p>;

  const productMap = new Map(products.map(product => [product._id, product]));

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
      <motion.div
        className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl mb-6 text-center font-semibold">All Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center mt-8">
            <NoOrdersSVG />
            <p className="text-gray-600 mt-4">No orders available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
              orders.map((order) => (
                <motion.div
                  key={order._id}
                  className="border border-gray-300 rounded-lg p-4 bg-white shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg font-semibold mb-2">Order ID: {order._id}</h2>
                  <p className="mb-2 text-gray-700">Status: {order.status}</p>
                  <p className="mb-2 text-gray-700">Total Amount: ${order.totalAmount.toFixed(2)}</p>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Items:</h3>
                    <ul className="list-disc list-inside mb-2">
                      {order.items.length === 0 ? (
                        <div className="text-center text-gray-600">
                          <NoProductsSVG />
                          <p className="mt-4">No products in this order.</p>
                        </div>
                      ) : (
                        order.items.map((item) => {
                          const product = productMap.get(item.productId);
                          return (
                            <li key={item._id} className="flex items-center mb-3">
                              {product ? (
                                <>
                                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mr-4 rounded-lg" />
                                  <div>
                                    <p className="font-semibold">{product.name}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Price: ${product.price.toFixed(2)}</p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-gray-500">Product details not available</p>
                              )}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </motion.div>
              ))
            }
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AllOrders;
