import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";
import Logo1 from "../assets/Logos/logo6.png";
import Logo8 from "../assets/Logos/logo8.png";
import { SlArrowDown } from "react-icons/sl";

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const hasSentWelcome = useRef(false);
  const bottomRef = useRef(null);

  // Auto-scroll
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

  // Welcome message
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

  // QUICK MESSAGE BTN (if needed)
  const sendQuickMessage = (text) => {
    setInput(text);
    setTimeout(() => handleSend(), 150);
  };

  // MAIN SEND FUNCTION — NOW CONNECTED TO WEBHOOK
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, time: getTimestamp() };
    setMessages((prev) => [...prev, userMsg]);
    const userText = input;
    setInput("");

    // Show typing animation
    setIsTyping(true);

    try {
      // === SEND TO N8N WEBHOOK ===
      const res = await fetch(
        "https://ajanibot.app.n8n.cloud/webhook/d9b0daf9-cb6e-49d4-a25c-9ed59f599490",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            user: user?.email ?? "guest",
            time: new Date().toISOString(),
          }),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = { reply: "Sorry, invalid response from Ajani bot." };
      }

      const botReply =
        data?.reply || "Ajani bot could not process this request.";

      // Insert bot reply
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, ai: true, time: getTimestamp() },
      ]);
    } catch (err) {
      // Webhook FAILED → fallback message
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't reach Ajani's brain 🧠. Please try again.",
          ai: true,
          time: getTimestamp(),
        },
      ]);
    }

    setIsTyping(false);
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
              md:w-[400px] md:h-[540px]
              md:bottom-6 md:right-6 
              bg-white shadow-2xl border border-gray-200 
              flex flex-col overflow-hidden
            "
          >
            {/* HEADER */}
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex items-center justify-between">
              <img src={Logo1} className="w-20 object-contain" />
              <button onClick={onClose} className="text-white text-xl">
                <SlArrowDown />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 font-rubik">
              {messages.map((msg, i) => (
                <div key={i} className="mb-5">
                  {msg.sender === "bot" && (
                    <p className="text-xs text-gray-500 mb-1 ml-10">Ajani</p>
                  )}

                  <div
                    className={`flex items-start gap-2 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <img src={Logo8} className="w-4 object-contain" />
                    )}

                    <div
                      className={`p-3 max-w-[75%] leading-relaxed text-[15px] relative
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
              ))}

              {/* Typing Animation */}
              {isTyping && (
                <div className="flex items-center gap-2 mt-3">
                  <img src={Logo8} className="w-4 object-contain" />

                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT BOX */}
            <div className="p-3 bg-white flex gap-2 font-rubik">
              <input
                className="flex-1 border rounded-full px-3 py-2 text-sm 
                  focus:outline-none focus:ring-1 focus:ring-[rgb(0,6,90)]"
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`px-5 py-2 rounded-full text-sm font-medium transition 
                  ${
                    input.trim()
                      ? "bg-[rgb(0,6,90)] hover:bg-[#0a155d] text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
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
