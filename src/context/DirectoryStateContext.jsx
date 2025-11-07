// src/context/DirectoryStateContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const DirectoryStateContext = createContext();

export const DirectoryStateProvider = ({ children }) => {
  const [resetFilters, setResetFilters] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [targetPage, setTargetPage] = useState(1);

  // In DirectoryStateContext.jsx
  const triggerFind = (businessId, filteredList, itemsPerPage = 6) => {
    const index = filteredList.findIndex((item) => item.id == businessId);
    if (index === -1) return;

    const page = Math.floor(index / itemsPerPage) + 1;
    setTargetPage(page);
    setHighlightId(`business-${businessId}`);
    setResetFilters(true);
    setTimeout(() => setResetFilters(false), 200);
  };

  // Clear highlight after use (optional, prevents stale highlights)
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        setHighlightId(null);
      }, 5000); // auto-clear after 5s
      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  return (
    <DirectoryStateContext.Provider
      value={{
        resetFilters,
        highlightId,
        targetPage,
        triggerFind,
      }}
    >
      {children}
    </DirectoryStateContext.Provider>
  );
};

export const useDirectoryState = () => {
  const context = useContext(DirectoryStateContext);
  if (!context) {
    throw new Error(
      "`useDirectoryState` must be used within a `DirectoryStateProvider`"
    );
  }
  return context;
};
