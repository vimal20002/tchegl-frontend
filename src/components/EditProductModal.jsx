import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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
    mutationFn: (updatedProduct) => axios.put(`http://localhost:5000/api/products/${product._id}`, updatedProduct),
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
    if (Object.values(formData).some(value => value.trim() === '')) {
      console.error('All fields are required');
      return;
    }
    editProductMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-md w-96 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          &times;
        </button>
        <h2 className="text-2xl mb-6 text-center">Edit Product</h2>
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
            className="mb-4 p-2 w-full border rounded"
          />
          <label htmlFor="image" className="block text-sm font-medium mb-2">Product Image</label>
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="mb-4 p-2 w-full border rounded"
          />
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover mb-4" />}
          <label htmlFor="description" className="block text-sm font-medium mb-2">Product Description</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            placeholder="Product Description"
            onChange={handleChange}
            required
            className="mb-4 p-2 w-full border rounded"
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
            className="mb-4 p-2 w-full border rounded"
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
            className="mb-4 p-2 w-full border rounded"
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
            className="mb-4 p-2 w-full border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded w-full"
            disabled={editProductMutation.isLoading}
          >
            {editProductMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          {editProductMutation.isError && (
            <p className="text-red-600 mt-2">Error updating product: {editProductMutation.error.message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
