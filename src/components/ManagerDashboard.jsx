import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import AllOrders from './AllOrders';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

const fetchProducts = async () => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get('http://localhost:5000/api/products', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const deleteProduct = async (productId) => {
  const token = localStorage.getItem("token");
  await axios.delete(`http://localhost:5000/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const ManagerDashboard = () => {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
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

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Error loading products: {error.message}</p>;

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl mb-4 text-center">Manager Dashboard</h1>
        <button onClick={handleAddClick} className="bg-green-500 text-white py-2 px-4 rounded mb-4 block mx-auto">Add New Product</button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <p className="text-center">No products available</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="border p-4 rounded">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
                <h2 className="text-xl">{product.name}</h2>
                <p>{product.description}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Weight: {product.weight} kg</p>
                <p>Price: ${product.price}</p>
                <div className='flex gap-2 justify-center mt-2'>
                  <button onClick={() => handleEditClick(product)} className="bg-blue-500 text-white py-1 px-2 rounded">Edit</button>
                  <button onClick={() => handleDeleteClick(product._id)} className="bg-red-500 text-white py-1 px-2 rounded">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
        <AllOrders />
        {isEditModalOpen && <EditProductModal product={selectedProduct} setIsEditModalOpen={setIsEditModalOpen} />}
        {isAddModalOpen && <AddProductModal setIsAddModalOpen={setIsAddModalOpen} />}
      </div>
    </div>
  );
};

export default ManagerDashboard;
