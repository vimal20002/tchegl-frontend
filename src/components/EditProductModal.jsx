import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';

const EditProductModal = ({ product, setIsEditModalOpen }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    image: product.image,
    description: product.description,
    quantity: product.quantity,
    weight: product.weight,
    price: product.price
  });
  const [imagePreview, setImagePreview] = useState(product.image);

  const queryClient = useQueryClient();
  const editProductMutation = useMutation({
    mutationFn: async (updatedProduct) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      await axios.put(`https://tchegl-backend.onrender.com/api/products/${product._id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    }
  });

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, image: reader.result });
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if any field is empty
    if (Object.values(formData).some(value => String(value).trim() === '')) {
      console.error('All fields are required');
      return;
    }
    
    editProductMutation.mutate(formData);
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-96 relative max-h-[90vh] overflow-y-auto"
        initial={{ y: '-50px', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          &times;
        </button>
        <h2 className="text-2xl mb-6 text-center font-bold">Edit Product</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="block text-sm font-medium mb-2">Product Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            placeholder="Product Name"
            onChange={handleChange}
            required
            className="mb-4 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="image" className="block text-sm font-medium mb-2">Product Image</label>
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="mb-4 p-2 w-full border rounded-lg"
          />
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover mb-4 rounded-lg shadow-md" />}
          <label htmlFor="description" className="block text-sm font-medium mb-2">Product Description</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            placeholder="Product Description"
            onChange={handleChange}
            required
            className="mb-4 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="quantity" className="block text-sm font-medium mb-2">Quantity</label>
          <input
            id="quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            placeholder="Quantity"
            onChange={handleChange}
            required
            className="mb-4 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="weight" className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            name="weight"
            value={formData.weight}
            placeholder="Weight (kg)"
            onChange={handleChange}
            required
            className="mb-4 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="price" className="block text-sm font-medium mb-2">Price ($)</label>
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            placeholder="Price ($)"
            onChange={handleChange}
            required
            className="mb-4 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-700 transition duration-300"
            disabled={editProductMutation.isLoading}
          >
            {editProductMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          {editProductMutation.isError && (
            <p className="text-red-600 mt-2">Error updating product: {editProductMutation.error.message}</p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProductModal;
