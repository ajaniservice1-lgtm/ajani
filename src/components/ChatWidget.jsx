// src/components/ChatWidget.js
import React, { useState } from "react";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // 🔗 Replace with your actual n8n webhook URL
      const response = await fetch(
        "https://olaben09.app.n8n.cloud/webhook/27ad30ba-e789-40a3-818f-2b0423edfa79",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: input }),
        }
      );

      const data = await response.json();

      // Add bot response
      const botMessage = {
        sender: "bot",
        text: data.response || "Sorry, I couldn't find an answer.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button (when closed) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-[#172c69] hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
        >
          💬 Ask Ajani
        </button>
      )}

      {/* Chat Window (when open) */}
      {isOpen && (
        <div className="w-80 bg-white border border-gray-300 rounded-xl shadow-xl flex flex-col h-96">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span>💬 Ask Ajani</span>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm">
                Ask me anything about businesses in Ibadan!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-blue-100 ml-auto text-blue-800"
                    : "bg-gray-200 mr-auto text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="text-gray-500 text-sm italic">
                Ajani is typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-gray-300 flex gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question..."
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
