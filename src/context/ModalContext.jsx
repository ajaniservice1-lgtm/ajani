// src/context/ModalContext.jsx
import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalCount, setModalCount] = useState(0);

  // Derived state: is any modal open
  const isAnyModalOpen = modalCount > 0;

  const openModal = () => setModalCount((c) => c + 1);
  const closeModal = () => setModalCount((c) => Math.max(0, c - 1));

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
