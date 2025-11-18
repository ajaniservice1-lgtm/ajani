// src/components/ChatWidget.jsx
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
  const hasSentWelcome = useRef(false);
  const bottomRef = useRef(null);

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

  // Send welcome on open
  useEffect(() => {
    if (isOpen && !hasSentWelcome.current) {
      const displayName = getDisplayName();
      const greeting = getGreeting();
      const welcomeText = `${greeting} ${displayName}! I'm Ajani 👋\nAsk about hotels, food, or events in Ibadan!`;

      setMessages([
        { sender: "bot", text: welcomeText, ai: true, time: getTimestamp() },
      ]);
      hasSentWelcome.current = true;
    }
  }, [isOpen, user]);

  // ✅ Handle send — now with training-mode support & better resilience
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, time: getTimestamp() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 🔒 TEMPORARY: Disable Google Sheets backend during Ajani's training
      // Replace with real n8n webhook when ready
      const IS_TRAINING_MODE = true; // 👈 Set to `false` when training is over

      if (IS_TRAINING_MODE) {
        // Friendly training-phase response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "🛠️ Ajani is currently in training mode — this means I'm learning new things to serve you better! I'll be back fully soon. Thanks for your patience! 😊",
              ai: true,
              time: getTimestamp(),
            },
          ]);
          setIsTyping(false);
        }, 800);
        return;
      }

      // ✅ REAL n8n INTEGRATION (when IS_TRAINING_MODE = false)
      const WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK;
      if (!WEBHOOK_URL) {
        throw new Error("n8n webhook URL not configured");
      }

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          userId: user?.id || "anon",
          name: getDisplayName(),
          timestamp: new Date().toISOString(),
        }),
      });

      // Log raw response for debugging (helpful in production logs via Sentry, etc.)
      console.log("n8n response status:", response.status);
      let data;
      try {
        data = await response.json();
        console.log("n8n response data:", data);
      } catch (parseError) {
        console.error("Failed to parse JSON from n8n:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }

      // Ensure reply is a valid string
      const reply =
        typeof data.reply === "string" && data.reply.trim() !== ""
          ? data.reply
          : "Hmm... I couldn’t find an answer. Try rephrasing? (e.g., 'best hotels near UI')";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: reply, ai: true, time: getTimestamp() },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      const fallback =
        "⚠️ Oops! Something went wrong on my end. Ajani is working on it — try again in a moment? 🙏";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: fallback, ai: true, time: getTimestamp() },
      ]);
      toast.error("Message delivery failed", { duration: 3000 });
    } finally {
      setIsTyping(false);
    }
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
              md:w-[400px] md:h-[530px]
              md:bottom-6 md:right-6 
              bg-white shadow-2xl border border-gray-200 
              flex flex-col overflow-hidden
            "
          >
            {/* HEADER — with Logo instead of text ✅ */}
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex items-center justify-between">
              <img
                src={Logo1}
                alt="AjaniAI Logo"
                className="w-20 object-contain"
                title="AjaniAI — Smart Business Directory for Ibadan"
              />
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
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Opening chat…
                </div>
              ) : (
                messages.map((msg, i) => (
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
                        className={`p-3 max-w-[80%] leading-relaxed text-[15px] relative
                          ${
                            msg.sender === "user"
                              ? "bg-[rgb(0,6,90)] text-white rounded-2xl rounded-br-none"
                              : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                          }`}
                      >
                        {msg.text.split("\n").map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}

                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

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

            {/* INPUT BOX — Send icon + Enter support */}
            <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                placeholder="Type a message… (e.g., 'restaurants in Bodija')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2.5 rounded-full text-white transition 
                  ${
                    input.trim()
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
