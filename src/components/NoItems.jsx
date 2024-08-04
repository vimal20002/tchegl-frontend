import React from 'react';

const NoItems = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h2 className="text-2xl mb-4">No Items Available</h2>
        <p className="text-gray-600">There are currently no items available. Please check back later.</p>
      </div>
    </div>
  );
};

export default NoItems;
