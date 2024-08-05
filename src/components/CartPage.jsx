import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define an SVG for an empty cart
const EmptyCartIcon = () => (
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
    <circle cx="10" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M1 1h4l2 9h13l2-9h4" />
    <path d="M6 14h13l1 6H6l-1-6z" />
  </svg>
);

// Fetch cart data
const fetchCart = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const { data } = await axios.get('https://tchegl-backend.onrender.com/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { items: [] }; // Return an empty cart if 404
    }
    throw error;
  }
};

// Fetch product details by ID
const fetchProductById = async (productId) => {
  const { data } = await axios.get(`https://tchegl-backend.onrender.com/api/products/${productId}`);
  return data;
};

const CartPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const { data: cart = { items: [] }, error: cartError, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    onError: (error) => {
      if (error.message === "Not authenticated") {
        navigate('/login');
      }
    },
    // Add a cache time to ensure the latest data is fetched
    cacheTime: 0
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const token = localStorage.getItem("token");
      return axios.put('https://tchegl-backend.onrender.com/api/cart/item', { productId, quantity }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Error updating cart item:', error);
      alert(`Error updating cart item: ${error.message}`);
    }
  });

  const deleteCartMutation = useMutation({
    mutationFn: async (itemId) => {
      const token = localStorage.getItem("token");
      return axios.delete(`https://tchegl-backend.onrender.com/api/cart/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Error deleting cart item:', error);
      alert(`Error deleting cart item: ${error.message}`);
    }
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      return axios.post('https://tchegl-backend.onrender.com/api/cart/place-order', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      navigate('/orders'); // Redirect to orders page
    },
    onError: (error) => {
      console.error('Error placing order:', error);
      alert(`Error placing order: ${error.message}`);
    }
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (cart.items.length > 0) {
        const productPromises = cart.items.map(item => fetchProductById(item.productId));
        const productsData = await Promise.all(productPromises);
        setProducts(productsData);
      } else {
        setProducts([]); // Clear products if cart is empty
      }
    };
    fetchProducts();
  }, [cart]);

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return; // Prevent setting quantity less than 1
    updateCartMutation.mutate({ productId, quantity });
  };

  const handleDeleteItem = (itemId, productId) => {
    deleteCartMutation.mutate(itemId);
    // Optional: Remove the product from the products state if you want instant UI update
    setProducts((prevProducts) => prevProducts.filter(product => product._id !== productId));
  };

  const handlePlaceOrder = () => {
    placeOrderMutation.mutate();
  };

  if (isCartLoading) return <div className="text-center text-lg">Loading...</div>;
  if (cartError) return <div className="text-center text-lg text-red-600">Error: {cartError.message}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">My Cart</h1>
      {cart.items.length === 0 ? (
        <div className="text-center text-lg">
          <EmptyCartIcon />
          <p className="mt-4">Your cart is empty.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {products.map((product, index) => {
            const item = cart.items.find(item => item.productId === product._id);
            if (!item) return null; // Skip if item not found in cart
            return (
              <motion.div
                key={product._id}
                className="bg-white p-4 rounded shadow-lg transform transition-transform hover:scale-105"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded"/>
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-700 mb-2">{product.description}</p>
                <p className="font-bold text-lg mb-4">Price: ${product.price}</p>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                    className="bg-gray-300 text-black py-1 px-3 rounded mr-2 hover:bg-gray-400"
                  >
                    -
                  </button>
                  <span className="mx-4 text-lg">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                    className="bg-gray-300 text-black py-1 px-3 rounded ml-2 hover:bg-gray-400"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteItem(item._id, product._id)}
                  className="bg-red-500 text-white py-2 px-4 rounded mt-4 hover:bg-red-600"
                >
                  Remove
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      {cart.items.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={handlePlaceOrder}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
