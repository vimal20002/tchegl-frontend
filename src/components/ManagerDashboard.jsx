import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AllOrders from './AllOrders';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

const fetchProducts = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get('https://tchegl-backend.onrender.com/api/products', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const deleteProduct = async (productId) => {
  const token = localStorage.getItem("token");
  await axios.delete(`https://tchegl-backend.onrender.com/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const ManagerDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    onError: (error) => {
      if (error.message === "Not authenticated") {
        navigate('/login');
      }
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      alert(`Error deleting product: ${error.message}`);
    }
  });

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (productId) => {
    deleteProductMutation.mutate(productId);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  // Check authentication and role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== 'manager') {
      navigate('/');
    }
  }, [navigate]);

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Error loading products: {error.message}</p>;

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl mb-4 text-center font-bold">Manager Dashboard</h1>
        <button 
          onClick={handleAddClick} 
          className="bg-green-600 text-white py-2 px-4 rounded mb-4 block mx-auto hover:bg-green-700 transition-colors"
        >
          Add New Product
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <p className="text-center text-gray-600">No products available</p>
          ) : (
            products.map((product) => (
              <motion.div
                key={product._id}
                className="border p-4 rounded-lg bg-white shadow-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-700 mb-2">{product.description}</p>
                <p className="text-gray-600">Quantity: {product.quantity}</p>
                <p className="text-gray-600">Weight: {product.weight} kg</p>
                <p className="text-gray-600">Price: ${product.price}</p>
                <div className='flex gap-2 justify-center mt-4'>
                  <button 
                    onClick={() => handleEditClick(product)} 
                    className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(product._id)} 
                    className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <AllOrders />
        {isEditModalOpen && <EditProductModal product={selectedProduct} setIsEditModalOpen={setIsEditModalOpen} />}
        {isAddModalOpen && <AddProductModal setIsAddModalOpen={setIsAddModalOpen} />}
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
