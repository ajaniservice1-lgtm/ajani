// src/components/NoDataMessage.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine, // ✅ For no-data icon
  faUndo, // ✅ For reset button
} from "@fortawesome/free-solid-svg-icons";

const NoDataMessage = ({ onReset, isDarkMode }) => {
  return (
    <div
      className={`p-6 rounded-lg shadow border text-center transition-all duration-300 ease-in-out ${
        isDarkMode
          ? "bg-gray-800 border-gray-700 text-gray-300"
          : "bg-blue-50 border-blue-200 text-gray-900"
      }`}
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        animation: "fadeInUp 0.6s ease forwards",
      }}
    >
      <FontAwesomeIcon
        icon={faChartLine}
        className={`text-3xl mb-4 ${
          isDarkMode ? "text-gray-400" : "text-gray-900"
        }`}
      />
      <h4 className="font-medium mb-1">
        No data available for selected filters.
      </h4>
      <p className="text-sm mb-4">
        Try selecting a different category or area.
      </p>
      <button
        onClick={onReset}
        className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
          isDarkMode
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-blue-100 hover:bg-blue-200 text-gray-900"
        }`}
      >
        <FontAwesomeIcon icon={faUndo} /> Reset Filters
      </button>
    </div>
  );
};

export default NoDataMessage;
