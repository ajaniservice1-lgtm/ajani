// src/context/ModalContext.jsx
import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext({
  isAnyModalOpen: false,
  openModal: () => {
    console.log("✅ Modal opened");
  },
  closeModal: () => {
    console.log("✅ Modal closed");
  },
});

export const ModalProvider = ({ children }) => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const openModal = () => setIsAnyModalOpen(true);
  const closeModal = () => setIsAnyModalOpen(false);

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};
