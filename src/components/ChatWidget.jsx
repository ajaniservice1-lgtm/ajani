// src/components/ChatWidget.jsx (FINAL INTEGRATED VERSION)
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
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

  const session = useRef({
    user_id: `user_${Math.random().toString(36).substring(2, 10)}`,
    session_id: `session_${Math.random().toString(36).substring(2, 10)}`,
  }).current;

  const hasWelcome = useRef(false);
  const bottomRef = useRef();

  // === Your n8n webhook URL ===
  const WEBHOOK =
    "https://ajanibot.app.n8n.cloud/webhook/c2f5c7a3-ac14-479f-b225-0842c6f64353";

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Timestamp
  const stamp = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Greeting
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning 🌞";
    if (h < 18) return "Good afternoon ☀️";
    return "Good evening 🌙";
  };

  const displayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "there";
  };

  // 🔥 Sends payload to n8n EXACTLY in the structure your router expects
  const sendToN8N = async (payload) => {
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: payload, // <== matches router
          user_session: session, // <== matches router
          timestamp: new Date().toISOString(),
        }),
      });

      const raw = await res.text();
      if (!raw) return { reply: { text: "⚠️ No response from server." } };

      try {
        return JSON.parse(raw);
      } catch {
        return { reply: { text: raw } };
      }
    } catch (err) {
      return {
        reply: {
          text: "⚠️ I'm having trouble connecting. Try again or use the quick menu below.",
        },
      };
    }
  };

  // Wrap n8n reply into message object
  const buildBotMessage = (r) => ({
    sender: "bot",
    text: r?.reply?.text || "How can I help you?",
    cards: r?.reply?.cards || null,
    buttons: r?.reply?.buttons || null,
    time: stamp(),
  });

  // === SHOW WELCOME ===
  useEffect(() => {
    if (isOpen && !hasWelcome.current) {
      hasWelcome.current = true;

      setMessages([
        {
          sender: "bot",
          text: `${greeting()} ${displayName()}! I'm Ajani 👋  
I can help you find hotels, food, bars, shortlets & services in Ibadan.`,
          time: stamp(),
          buttons: [
            { title: "🏨 Hotels", payload: "SUBMENU_hotel" },
            { title: "🍽 Food", payload: "SUBMENU_restaurant" },
            { title: "🍹 Bars", payload: "SUBMENU_bar" },
            { title: "🛍 Vendors", payload: "SUBMENU_services" },
            { title: "📍 Attractions", payload: "SUBMENU_attractions" },
            { title: "🎉 Events", payload: "SUBMENU_events" },
            { title: "🛒 Market Prices", payload: "SUBMENU_market" },
            { title: "🎓 Education", payload: "SUBMENU_education" },
            { title: "🚌 Transport", payload: "SUBMENU_transport" },
            { title: "🤖 Chat Search", payload: "CHAT_MODE" },
          ],
        },
      ]);
    }
  }, [isOpen]);

  // === ON BUTTON CLICK ===
  const handleButton = async (payload) => {
    setIsTyping(true);

    const raw = await sendToN8N({
      button_id: payload,
      user_id: session.user_id,
    });

    setIsTyping(false);
    setMessages((m) => [...m, buildBotMessage(raw)]);
  };

  // === ON TEXT SEND ===
  const handleSend = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    setMessages((m) => [...m, { sender: "user", text, time: stamp() }]);

    setIsTyping(true);

    const raw = await sendToN8N({
      text,
      user_id: session.user_id,
    });

    setIsTyping(false);
    setMessages((m) => [...m, buildBotMessage(raw)]);
  };

  // === RENDER MESSAGE CONTENT ===
  const renderMessage = (msg) => (
    <>
      {msg.text && <div className="mb-2 whitespace-pre-line">{msg.text}</div>}

      {msg.cards &&
        msg.cards.map((c, i) => (
          <div
            key={i}
            className="bg-white border rounded-lg p-3 mb-3 shadow-sm"
          >
            {c.imageUrl && (
              <img
                src={c.imageUrl}
                className="w-full h-24 object-cover rounded-md mb-2"
                alt=""
              />
            )}
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-gray-600 mb-2 whitespace-pre-line">
              {c.subtitle}
            </div>

            {c.buttons?.map((b, i2) => (
              <button
                key={i2}
                onClick={() => handleButton(b.payload)}
                className="bg-[rgb(0,6,90)] text-white text-xs px-2 py-1 rounded-full mr-1"
              >
                {b.title}
              </button>
            ))}
          </div>
        ))}

      {msg.buttons && (
        <div className="flex flex-wrap gap-2 mt-2">
          {msg.buttons.map((b, i) => (
            <button
              key={i}
              onClick={() => handleButton(b.payload)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full"
            >
              {b.title}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <Toaster />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-6
              w-full h-full md:w-[410px] md:h-[580px]
              bg-white border shadow-xl z-50 flex flex-col"
          >
            {/* HEADER */}
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src={Logo1} alt="logo" className="w-20" />
                <span className="text-xs bg-green-600 px-2 py-1 rounded">
                  LIVE
                </span>
              </div>
              <button onClick={onClose} className="text-xl">
                <SlArrowDown />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className="mb-4">
                  <div
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    } gap-2`}
                  >
                    {msg.sender === "bot" && (
                      <img src={Logo8} className="w-6 h-6 mt-1" alt="" />
                    )}

                    <div
                      className={`p-3 max-w-[80%] rounded-2xl text-sm ${
                        msg.sender === "user"
                          ? "bg-[rgb(0,6,90)] text-white rounded-br-none"
                          : "bg-white border rounded-tl-none"
                      }`}
                    >
                      {renderMessage(msg)}
                      <div className="text-[10px] text-gray-400 mt-1 text-right">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 mb-4">
                  <img src={Logo8} className="w-5 h-5" alt="" />
                  <div className="bg-white border px-4 py-2 rounded-2xl rounded-tl-none">
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

            {/* INPUT AREA */}
            <div className="p-3 border-t bg-white flex gap-2">
              <input
                className="flex-1 border px-4 py-2 rounded-full text-sm focus:ring-2 focus:ring-[rgb(0,6,90)] outline-none"
                placeholder="Ask Ajani anything in Ibadan…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                disabled={isTyping}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-full text-white ${
                  input.trim() && !isTyping ? "bg-[rgb(0,6,90)]" : "bg-gray-300"
                }`}
              >
                <FiSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
