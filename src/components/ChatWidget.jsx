// src/components/ChatWidget.jsx (Fixed version)
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";
import Logo1 from "../assets/Logos/logo6.png";
import Logo8 from "../assets/Logos/logo8.png";
import { SlArrowDown } from "react-icons/sl";
import { FiSend } from "react-icons/fi";

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userSession] = useState({
    user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
    session_id: `session_${Math.random().toString(36).substr(2, 9)}`,
  });
  const hasSentWelcome = useRef(false);
  const bottomRef = useRef(null);

  // n8n Webhook URL
  const WEBHOOK_URL = "https://ajanibot.app.n8n.cloud/webhook/chat-webhook";

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  // Send message to n8n webhook with better error handling
  const sendToN8N = async (messageData) => {
    try {
      console.log("Sending to n8n:", messageData);
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: messageData,
          user_session: userSession,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response has content
      const text = await response.text();
      console.log("Raw response:", text);
      
      if (!text) {
        return { reply: { text: "I received your message but didn't get a proper response. Please try again." } };
      }

      try {
        const result = JSON.parse(text);
        return result;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // If it's not JSON, treat it as plain text
        return { reply: { text: text || "I received your message. Thank you!" } };
      }
    } catch (error) {
      console.error("n8n webhook error:", error);
      throw error;
    }
  };

  // Process n8n response
  const processN8NResponse = (response) => {
    if (!response || !response.reply) {
      return {
        sender: "bot",
        text: "🤖 I'm here! Try asking about hotels, restaurants, or services in Ibadan.",
        time: getTimestamp(),
        buttons: [
          { title: "🏨 Hotels", payload: "SUBMENU_hotel" },
          { title: "🍽️ Restaurants", payload: "SUBMENU_restaurant" },
          { title: "🚌 Transport", payload: "SUBMENU_transport" },
        ],
      };
    }

    const botMessage = {
      sender: "bot",
      text: response.reply.text || "How can I help you today?",
      cards: response.reply.cards || null,
      buttons: response.reply.buttons || null,
      time: getTimestamp(),
    };

    return botMessage;
  };

  // Send welcome on open
  useEffect(() => {
    if (isOpen && !hasSentWelcome.current) {
      const displayName = getDisplayName();
      const greeting = getGreeting();

      const welcomeText = `${greeting} ${displayName}! I'm Ajani 👋\n\nI can help you find hotels, food, and services in Ibadan!`;

      setMessages([
        {
          sender: "bot",
          text: welcomeText,
          time: getTimestamp(),
          buttons: [
            { title: "🏨 Hotels & Shortlets", payload: "SUBMENU_hotel" },
            { title: "🍽️ Food & Restaurants", payload: "SUBMENU_restaurant" },
            { title: "🍹 Bars & Nightlife", payload: "SUBMENU_bar" },
            { title: "🛍️ Vendors & Services", payload: "SUBMENU_services" },
            { title: "📍 Places & Attractions", payload: "SUBMENU_attractions" },
            { title: "🎉 Events in Ibadan", payload: "SUBMENU_events" },
            { title: "🛒 Market Prices", payload: "SUBMENU_market" },
            { title: "🎓 Schools & Education", payload: "SUBMENU_education" },
            { title: "🚌 Transport & Logistics", payload: "SUBMENU_transport" },
            { title: "🤖 Chat Search", payload: "CHAT_MODE" },
          ],
        },
      ]);
      hasSentWelcome.current = true;
    }
  }, [isOpen, user]);

  // Handle button clicks
  const handleButtonClick = async (buttonPayload) => {
    setIsTyping(true);

    try {
      const response = await sendToN8N({
        button_id: buttonPayload,
        user_id: userSession.user_id,
      });

      const botMessage = processN8NResponse(response);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Button click error:", error);
      const errorMessage = {
        sender: "bot",
        text: "🚧 I'm still learning! Try typing your request instead, like 'hotels in Bodija' or 'restaurants near me'.",
        time: getTimestamp(),
        buttons: [
          { title: "🏨 Search Hotels", payload: "SEARCH_hotel" },
          { title: "🍽️ Find Food", payload: "SEARCH_restaurant" },
          { title: "🔄 Try Again", payload: "BACK_TO_MENU" },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle text message send
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: getTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendToN8N({
        text: userInput,
        user_id: userSession.user_id,
      });

      const botMessage = processN8NResponse(response);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Send message error:", error);
      const errorMessage = {
        sender: "bot",
        text: `I received your message about "${userInput}" but I'm having trouble processing it right now. You can try:\n\n• "hotels in Bodija"\n• "restaurants near UI"\n• "shortlets in Ibadan"`,
        time: getTimestamp(),
        buttons: [
          { title: "🏨 Hotels", payload: "SUBMENU_hotel" },
          { title: "🍽️ Food", payload: "SUBMENU_restaurant" },
          { title: "🚌 Transport", payload: "SUBMENU_transport" },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render message content
  const renderMessageContent = (message) => {
    return (
      <>
        {message.text && (
          <div className="mb-3">
            {message.text.split("\n").map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}

        {message.cards &&
          message.cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm"
            >
              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-24 object-cover rounded-md mb-2"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <h3 className="font-semibold text-gray-800 text-sm mb-1">
                {card.title}
              </h3>
              <p className="text-gray-600 text-xs mb-2 whitespace-pre-line">
                {card.subtitle}
              </p>
              <div className="flex flex-wrap gap-1">
                {card.buttons?.map((button, btnIndex) => (
                  <button
                    key={btnIndex}
                    onClick={() => handleButtonClick(button.payload)}
                    className="bg-[rgb(0,6,90)] hover:bg-[#0a155d] text-white text-xs px-2 py-1 rounded-full transition-colors"
                  >
                    {button.title}
                  </button>
                ))}
              </div>
            </div>
          ))}

        {message.buttons && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(button.payload)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-full transition-colors flex items-center gap-1"
              >
                {button.title}
              </button>
            ))}
          </div>
        )}
      </>
    );
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
            transition={{ duration: 0.25 }}
            className="
              fixed bottom-0 right-0 z-50 
              w-full h-full 
              md:w-[420px] md:h-[600px]
              md:bottom-6 md:right-6 
              bg-white shadow-2xl border border-gray-200 
              flex flex-col overflow-hidden
            "
          >
            {/* HEADER */}
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={Logo1}
                  alt="AjaniAI Logo"
                  className="w-20 object-contain"
                />
                <span className="text-xs bg-green-600 px-2 py-1 rounded">
                  LIVE
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white text-xl hover:text-gray-200 transition"
                aria-label="Close chat"
              >
                <SlArrowDown />
              </button>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className="mb-4">
                  {msg.sender === "bot" && (
                    <p className="text-xs text-gray-500 mb-1 ml-10">Ajani</p>
                  )}

                  <div
                    className={`flex items-start gap-2 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <img
                        src={Logo8}
                        alt="Ajani Bot"
                        className="w-5 h-5 object-contain mt-1 flex-shrink-0"
                      />
                    )}

                    <div
                      className={`p-3 max-w-[85%] leading-relaxed text-[15px] relative
                        ${
                          msg.sender === "user"
                            ? "bg-[rgb(0,6,90)] text-white rounded-2xl rounded-br-none"
                            : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                        }`}
                    >
                      {renderMessageContent(msg)}

                      <p className="text-[10px] text-gray-400 mt-2 text-right">
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 mt-3">
                  <img
                    src={Logo8}
                    alt="Ajani Bot"
                    className="w-5 h-5 object-contain flex-shrink-0"
                  />
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick Action Buttons */}
            <div className="px-3 pt-2 bg-white border-t border-gray-200">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleButtonClick("SUBMENU_hotel")}
                  disabled={isTyping}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  🏨 Hotels
                </button>
                <button
                  onClick={() => handleButtonClick("SUBMENU_restaurant")}
                  disabled={isTyping}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  🍽️ Food
                </button>
                <button
                  onClick={() => handleButtonClick("SUBMENU_transport")}
                  disabled={isTyping}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  🚌 Transport
                </button>
                <button
                  onClick={() => handleButtonClick("BACK_TO_MENU")}
                  disabled={isTyping}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                  title="Main Menu"
                >
                  📋 Menu
                </button>
              </div>
            </div>

            {/* INPUT BOX */}
            <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                placeholder="Ask about hotels, restaurants, services in Ibadan..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                autoFocus
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2.5 rounded-full text-white transition 
                  ${
                    input.trim() && !isTyping
                      ? "bg-[rgb(0,6,90)] hover:bg-[#0a155d] active:scale-95"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                aria-label="Send message"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;