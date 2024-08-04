import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fetchCart = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get('http://localhost:5000/api/cart', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const fetchProductById = async (productId) => {
  const { data } = await axios.get(`http://localhost:5000/api/products/${productId}`);
  return data;
};

const CartPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const { data: cart, error: cartError, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const token = localStorage.getItem("token");
      return axios.put('http://localhost:5000/api/cart/item', { productId, quantity }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  const deleteCartMutation = useMutation({
    mutationFn: async (itemId) => {
      const token = localStorage.getItem("token");
      return axios.delete(`http://localhost:5000/api/cart/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    }
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      return axios.post('http://localhost:5000/api/cart/place-order', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      navigate('/orders'); // Redirect to orders page
    }
  });

  useEffect(() => {
    if (cart?.items) {
      const fetchProducts = async () => {
        const productPromises = cart.items.map(item => fetchProductById(item.productId));
        const productsData = await Promise.all(productPromises);
        setProducts(productsData);
      };
      fetchProducts();
    }
  }, [cart]);

  const handleQuantityChange = (productId, quantity) => {
    updateCartMutation.mutate({ productId, quantity });
  };

  const handleDeleteItem = (itemId) => {
    deleteCartMutation.mutate(itemId);
  };

  const handlePlaceOrder = () => {
    placeOrderMutation.mutate();
  };

  if (isCartLoading) return <div>Loading...</div>;
  if (cartError) return <div>Error: {cartError.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">My Cart</h1>
      {products.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={product._id} className="bg-white p-4 rounded shadow">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4"/>
              <h2 className="text-xl mb-2">{product.name}</h2>
              <p>{product.description}</p>
              <p className="font-bold">Price: ${product.price}</p>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(product._id, cart.items[index].quantity - 1)}
                  className="bg-gray-300 text-black py-1 px-3 rounded"
                >
                  -
                </button>
                <span className="mx-4">{cart.items[index].quantity}</span>
                <button
                  onClick={() => handleQuantityChange(product._id, cart.items[index].quantity + 1)}
                  className="bg-gray-300 text-black py-1 px-3 rounded"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleDeleteItem(cart.items[index]._id)}
                className="bg-red-500 text-white py-2 px-4 rounded mt-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {products.length > 0 && (
        <button
          onClick={handlePlaceOrder}
          className="bg-blue-600 text-white py-2 px-4 rounded mt-6"
        >
          Place Order
        </button>
      )}
    </div>
  );
};

export default CartPage;
