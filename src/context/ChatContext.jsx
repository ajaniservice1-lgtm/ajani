// src/context/ChatContext.jsx
import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWidget from "../components/ChatWidget";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}

      {/* 🟢 Floating Chat Button (always visible when closed) */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            key="global-chat-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            whileTap={{ scale: 0.9 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 z-50 bg-[rgb(0,6,90)] hover:bg-[#0e1f45] text-white px-5 py-4 rounded-full shadow-lg"
          >
            💬 Ask Ajani
          </motion.button>
        )}
      </AnimatePresence>

      {/* 🟢 Chat Widget (only visible when open) */}
      {isChatOpen && <ChatWidget isOpen={isChatOpen} onClose={closeChat} />}
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
