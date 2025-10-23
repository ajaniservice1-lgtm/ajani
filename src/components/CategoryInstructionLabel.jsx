// src/components/CategoryInstructionLabel.jsx
import React from "react";

const CategoryInstructionLabel = ({ selectedCategory, isDarkMode }) => {
  // Show instruction label when no specific subcategory is selected
  // This includes: no selection, "All", or just a main category (without dot)
  const shouldShow =
    !selectedCategory ||
    selectedCategory === "All" ||
    !selectedCategory.includes(".");

  if (!shouldShow) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-lg border-l-4 ${
        isDarkMode
          ? "bg-gray-800 border-l-blue-500 text-[#172c69]"
          : "bg-blue-50 border-l-blue-500 text-blue-800"
      } transition-all duration-500 ease-in-out animate-fadeInUp`}
      style={{
        animation: "fadeInUp 0.6s ease forwards",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold">Select Category & Subcategory</h4>
          <p className="text-sm mt-1">
            Choose a main category (e.g., Accommodation) and a subcategory
            (e.g., Hotel) to see real-time price insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryInstructionLabel;
