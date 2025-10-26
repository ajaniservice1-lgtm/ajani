// src/components/CategoryDropdown.jsx

import React, { useState } from "react";

const CategoryDropdown = ({ value, onChange, isDarkMode }) => {
  const categoryMap = {
    accommodation: ["hotel", "guesthouse", "airbnb", "shortlet", "resort"],
    transport: ["ridehail", "carrental", "bus", "dispatch"],
    event: ["weekend", "concert", "art", "tech", "nightlife"],
  };

  const [mainCategory, setMainCategory] = useState(() => {
    if (!value) return "";
    const parts = value.split(".");
    return parts.length > 1 ? parts[0] : "";
  });

  const handleMainChange = (e) => {
    const main = e.target.value;
    setMainCategory(main);
    // Reset to first subcategory or empty
    if (main && categoryMap[main]?.length > 0) {
      onChange(`${main}.${categoryMap[main][0]}`);
    } else {
      onChange("All");
    }
  };

  const handleSubChange = (e) => {
    onChange(`${mainCategory}.${e.target.value}`);
  };

  const getSubcategory = () => {
    if (!value || value === "All") return "";
    const parts = value.split(".");
    return parts.length > 1 ? parts[1] : "";
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Main Category */}
      <select
        value={mainCategory}
        onChange={handleMainChange}
        className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 min-w-[140px] ${
          isDarkMode
            ? "bg-gray-800 text-white border-gray-700"
            : "bg-white text-gray-900 border-gray-300"
        }`}
      >
        <option value="">All Categories</option>
        {Object.keys(categoryMap).map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      {/* Subcategory (only if main category selected) */}
      {mainCategory && categoryMap[mainCategory] && (
        <select
          value={getSubcategory()}
          onChange={handleSubChange}
          className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 min-w-[140px] ${
            isDarkMode
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          {categoryMap[mainCategory].map((sub) => (
            <option key={sub} value={sub}>
              {sub.replace(/^\w/, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategoryDropdown;
