// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWidget from "../components/ChatWidget";
import { useModal } from "./ModalContext"; // ✅ Import modal context

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isAnyModalOpen } = useModal(); // ✅ Get modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
 console.log("📌 ChatContext: isAnyModalOpen =", isAnyModalOpen);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  // Optional: auto-close chat when modal opens
  useEffect(() => {
    if (isAnyModalOpen && isChatOpen) {
      closeChat();
    }
  }, [isAnyModalOpen, isChatOpen]);

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}

      {/* Floating Button — hidden when any modal is open */}
      <AnimatePresence>
        {!isChatOpen &&
          !isAnyModalOpen && ( // ✅ Critical: hide when any modal is open
            <motion.button
              key="global-chat-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={openChat}
              className="fixed bottom-6 right-6 z-50 bg-[rgb(0,6,90)] hover:bg-[#0e1f45] text-white px-5 py-4 rounded-full shadow-lg text-lg font-medium"
            >
              💬 Ask Ajani
            </motion.button>
          )}
      </AnimatePresence>

      <ChatWidget isOpen={isChatOpen} onClose={closeChat} />
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
