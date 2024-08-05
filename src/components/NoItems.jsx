import React from 'react';

const NoItems = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-32 h-32 mx-auto mb-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9m-9 9V12M12 3v18m9-9a9 9 0 0 1-9 9M12 3a9 9 0 0 1 0 18m0-9H3"
          />
        </svg>
        <h2 className="text-2xl mb-4">No Items Available</h2>
        <p className="text-gray-600">It looks like there are no items here right now. Please check back later or browse other sections.</p>
      </div>
    </div>
  );
};

export default NoItems;
