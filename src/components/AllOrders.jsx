import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Function to fetch orders from the backend
const fetchOrders = async () => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get('http://localhost:5000/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

// Function to fetch product details
const fetchProductDetails = async (productId) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(`http://localhost:5000/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

// Custom hook to fetch products details for a list of product IDs
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
  const [productIds, setProductIds] = useState([]);
  
  // Fetch orders using react-query
  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders
  });

  // Extract unique product IDs
  useEffect(() => {
    if (orders.length > 0) {
      const ids = orders.flatMap(order => order.items.map(item => item.productId));
      setProductIds([...new Set(ids)]); // Ensure unique product IDs
    }
  }, [orders]);

  // Fetch product details
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts(productIds);

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status }, {
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
    }
  });

  // Handle status change
  const handleStatusChange = (orderId, status) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  if (isLoading || productsLoading) return <p>Loading...</p>;
  if (isError || productsError) return <p>Error loading data: {error?.message || productsError?.message}</p>;

  // Create a map of product ID to product details for quick lookup
  const productMap = new Map(products.map(product => [product._id, product]));

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl mb-4 text-center">All Orders</h1>
        {orders.length === 0 ? (
          <p className="text-center">No orders available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div key={order._id} className="border p-4 rounded">
                <h2 className="text-xl mb-2">Order ID: {order._id}</h2>
                <p className="mb-2">Status: {order.status}</p>
                <p className="mb-2">Total Amount: ${order.totalAmount}</p>
                <div>
                  <h3 className="text-lg mb-2">Items:</h3>
                  <ul className="list-disc list-inside mb-2">
                    {order.items.map((item) => {
                      const product = productMap.get(item.productId);
                      return (
                        <li key={item._id} className="flex items-center mb-2">
                          {product ? (
                            <>
                              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mr-4" />
                              <div>
                                <p><strong>{product.name}</strong> - Quantity: {item.quantity}</p>
                                <p>Price: ${product.price}</p>
                              </div>
                            </>
                          ) : (
                            <p>Product details not available</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="mt-2 p-2 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
