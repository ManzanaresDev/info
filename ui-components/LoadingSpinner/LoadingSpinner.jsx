// Spinner.jsx
import React from "react";

const LoadingSpinner = ({ className = "" }) => {
  return (
    <div className="flex justify-center items-center backdrop-blur-sm">
      {/* Conteneur carré avec padding */}
      <div className="bg-black/20 p-8 rounded-lg flex justify-center items-center">
        {/* Spinner animé */}
        <div className={`rounded-full animate-spin ${className}`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
