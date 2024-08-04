import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchUserOrders = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const { data } = await axios.get(`http://localhost:5000/api/orders/user`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const UserOrders = ({ userId }) => {
  const queryKey = ['userOrders', userId];
  
  const { data: orders, error, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchUserOrders(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Your Orders</h2>
      {orders.length === 0 ? (
        <div>No orders found</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map(order => (
            <div key={order._id} className="border p-4 rounded shadow">
              <h3 className="text-xl mb-2">Order ID: {order._id}</h3>
              <p className="mb-2">Status: {order.status}</p>
              <p className="mb-2">Total: ${order.totalAmount}</p>
              <div>
                <h4 className="text-lg mb-2">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.productId.name} - {item.quantity} pcs
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
