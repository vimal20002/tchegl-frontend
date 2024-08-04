import React from 'react';

const Product = ({ product }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <img src={product.image} alt={product.name} className="w-full h-32 object-cover mb-4" />
      <h3 className="text-xl mb-2">{product.name}</h3>
      <p>{product.description}</p>
      <p>{product.weight} kg</p>
      <p>{product.quantity} available</p>
      <p>${product.price}</p>
    </div>
  );
};

export default Product;
