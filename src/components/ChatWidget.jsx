import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const hasSentWelcome = useRef(false);

  // === Greeting & welcome message ===
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) {
      return user.email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, " ")
        .split(/\s+/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
    }
    return "there";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 🌞";
    if (hour < 18) return "Good afternoon! ☀️";
    return "Good evening! 🌙";
  };

  useEffect(() => {
    if (isOpen && !hasSentWelcome.current) {
      const displayName = getDisplayName();
      const greeting = getGreeting();
      const welcomeText = `${greeting} ${displayName}! I'm Ajani 👋\n\nAsk about hotels, food, or events in Ibadan!\n• “Cheapest hotels”\n• “Restaurants in Bodija”\n• “Events near me”`;
      setMessages([{ sender: "bot", text: welcomeText }]);
      hasSentWelcome.current = true;
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) setInput("");
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate brief thinking delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Fixed reply — no fetching, no logic branching
    const reply = "Check back later, Ajani bot is on training...";

    // Add bot reply
    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    toast.success("Ajani replied!");
    setIsTyping(false);
  };

  // === UI Animation Variants ===
  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
  };

  return (
    <>
      <Toaster position="top-right" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[320px] h-[384px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex justify-between items-center">
              <span className="font-medium">💬 Ask Ajani</span>
              <button
                onClick={onClose}
                className="text-white text-lg font-bold hover:text-gray-200"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    variants={bubbleVariants}
                    initial="hidden"
                    animate="visible"
                    className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                      msg.sender === "user"
                        ? "bg-blue-100 ml-auto"
                        : "bg-gray-200 mr-auto"
                    }`}
                  >
                    {msg.text.split("\n").map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <p className="text-gray-500 italic text-sm py-1">
                  Ajani is thinking...
                </p>
              )}
            </div>

            {/* Input Area */}
            <div className="p-2 border-t bg-white flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="E.g., cheapest hotels"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  input.trim()
                    ? "bg-[rgb(0,6,90)] hover:bg-[#0a155d] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } transition`}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
