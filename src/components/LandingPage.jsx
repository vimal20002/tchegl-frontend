import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NoItems from './NoItems'; // Import the NoItems component

const fetchItems = async () => {
  const { data } = await axios.get('https://tchegl-backend.onrender.com/api/products');
  return data;
};

const addToCart = async ({ productId, quantity }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  await axios.post(
    'https://tchegl-backend.onrender.com/api/cart',
    { productId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items, error, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems
  });

  const mutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // Show an alert and redirect to cart
      alert('Item added to cart!');
      navigate('/cart');
      queryClient.invalidateQueries(['items']); // Example to refetch items
    },
    onError: (error) => {
      console.error('Error adding item to cart:', error.message);
      if (error.message === "No token found") {
        navigate('/login');
      }
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // If there are no items, render the NoItems component
  if (items?.length === 0) return <NoItems />;

  const handleAddToCart = (itemId) => {
    const token = localStorage.getItem("token");
    if (token) {
      mutation.mutate({
        productId: itemId,
        quantity: 1 // Adjust quantity as needed
      });
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6 text-center font-bold">Landing Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map(item => (
          <motion.div
            key={item._id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover mb-4 rounded-lg"
            />
            <h2 className="text-xl mb-2 font-semibold">{item.name}</h2>
            <p className="mb-2">{item.description}</p>
            <p className="font-bold mb-4">Price: ${item.price}</p>
            <button
              onClick={() => handleAddToCart(item._id)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
