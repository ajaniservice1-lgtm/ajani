import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://olaben09.app.n8n.cloud/webhook/27ad30ba-e789-40a3-818f-2b0423edfa79",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        }
      );

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.response || "Ajani is on training!!! Coming soon.",
      };

      setMessages((prev) => [...prev, botMessage]);
      toast.success("Ajani replied!");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Ajani is on training!!! Coming soon." },
      ]);
      toast.error("Ajani is on training!!! Coming soon.");
    } finally {
      setIsTyping(false);
    }
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
            padding: "10px 14px",
          },
        }}
      />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-[320px] h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[rgb(0,6,90)] text-white p-3 flex justify-between items-center">
                <span className="font-medium">💬 Ask Ajani</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Ask something about businesses in Ibadan!
                  </p>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        variants={bubbleVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                          msg.sender === "user"
                            ? "bg-blue-100 ml-auto text-blue-800"
                            : "bg-gray-200 mr-auto text-gray-800"
                        }`}
                      >
                        {msg.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {isTyping && (
                  <p className="text-gray-500 italic text-sm">
                    Ajani is typing...
                  </p>
                )}
              </div>

              {/* Input */}
              <div className="p-2 border-t bg-white flex gap-2">
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-[rgb(0,6,90)] hover:bg-[#0a155d] text-white px-3 py-1 rounded text-sm"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="chat-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="bg-[rgb(0,6,90)] hover:bg-[#0e1f45] text-white px-5 py-4 rounded-full shadow-lg"
            >
              💬 Ask Ajani
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ChatWidget;
