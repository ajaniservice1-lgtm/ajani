// src/context/ModalContext.jsx
import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [openModals, setOpenModals] = useState({}); // Track all modals by name

  const openModal = (name) =>
    setOpenModals((prev) => ({ ...prev, [name]: true }));
  const closeModal = (name) =>
    setOpenModals((prev) => ({ ...prev, [name]: false }));

  const isAnyModalOpen = Object.values(openModals).some(Boolean);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isAnyModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
