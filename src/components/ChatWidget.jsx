import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";
import Logo1 from "../assets/Logos/logo6.png";
import Logo8 from "../assets/Logos/logo8.png";
import { SlArrowDown } from "react-icons/sl";
import { FiSend } from "react-icons/fi";
import { IoReload, IoTrash } from "react-icons/io5";

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const session = useRef({
    user_id: user?.id || `user_${Math.random().toString(36).substring(2, 10)}`,
    session_id: `session_${Math.random().toString(36).substring(2, 10)}`,
  }).current;

  const bottomRef = useRef();
  const inputRef = useRef();

  const WEBHOOK =
    "https://ajanibot.app.n8n.cloud/webhook/c2f5c7a3-ac14-479f-b225-0842c6f64353";

  const stamp = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Enhanced error handling with retry mechanism
  const sendToN8N = async (payload, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: payload,
            user_session: session,
            timestamp: new Date().toISOString(),
            user: user ? { id: user.id, email: user.email } : null,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const raw = await res.text();
        if (!raw) {
          throw new Error("Empty response from server");
        }

        setConnectionError(false);

        try {
          return JSON.parse(raw);
        } catch (parseError) {
          console.warn("Response is not JSON, returning as text:", raw);
          return { reply: { text: raw } };
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          setConnectionError(true);
          if (error.name === "AbortError") {
            return {
              reply: {
                text: "⏰ Request timeout. Please check your connection and try again.",
              },
            };
          }
          return {
            reply: {
              text: "🔌 Connection issue detected. Please check your internet connection or try again later.",
            },
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const buildBotMessage = (r) => ({
    sender: "bot",
    text: r?.reply?.text || "",
    cards: r?.reply?.cards || null,
    buttons: r?.reply?.buttons || null,
    time: stamp(),
    id: Date.now() + Math.random(),
  });

  const buildUserMessage = (text) => ({
    sender: "user",
    text,
    time: stamp(),
    id: Date.now() + Math.random(),
  });

  const handleButton = async (payload) => {
    if (isTyping || isSending) return;

    setIsTyping(true);
    const raw = await sendToN8N({
      button_id: payload,
      user_id: session.user_id,
    });
    setIsTyping(false);
    setMessages((m) => [...m, buildBotMessage(raw)]);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending || isTyping) return;

    const text = input.trim();
    setInput("");
    setIsSending(true);

    const userMessage = buildUserMessage(text);
    setMessages((m) => [...m, userMessage]);

    setIsTyping(true);
    const raw = await sendToN8N({ text, user_id: session.user_id });
    setIsTyping(false);
    setIsSending(false);

    setMessages((m) => [...m, buildBotMessage(raw)]);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(`chat_${session.user_id}`);
    setConnectionError(false);

    // Restart with menu
    (async () => {
      setIsTyping(true);
      const raw = await sendToN8N({ text: "menu", user_id: session.user_id });
      setIsTyping(false);
      setMessages([buildBotMessage(raw)]);
    })();
  };

  const handleRetryConnection = () => {
    setConnectionError(false);
    // Retry last message or get menu
    if (
      messages.length > 0 &&
      messages[messages.length - 1].sender === "user"
    ) {
      const lastMessage = messages[messages.length - 1].text;
      (async () => {
        setIsTyping(true);
        const raw = await sendToN8N({
          text: lastMessage,
          user_id: session.user_id,
        });
        setIsTyping(false);
        setMessages((m) => [...m, buildBotMessage(raw)]);
      })();
    } else {
      (async () => {
        setIsTyping(true);
        const raw = await sendToN8N({ text: "menu", user_id: session.user_id });
        setIsTyping(false);
        setMessages([buildBotMessage(raw)]);
      })();
    }
  };

  // Memoized message renderer for better performance
  const renderMessage = useCallback(
    (msg) => (
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
                  alt={c.title || "Card image"}
                  loading="lazy"
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
                  disabled={isTyping || isSending}
                  className="bg-[rgb(0,6,90)] text-white text-xs px-2 py-1 rounded-full mr-1 mb-1 hover:bg-[rgb(0,10,120)] disabled:opacity-50"
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
                disabled={isTyping || isSending}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full disabled:opacity-50"
              >
                {b.title}
              </button>
            ))}
          </div>
        )}
      </>
    ),
    [isTyping, isSending]
  );

  // Auto-fetch menu when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const savedMessages = localStorage.getItem(`chat_${session.user_id}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Failed to load saved messages:", e);
          fetchInitialMenu();
        }
      } else {
        fetchInitialMenu();
      }
    }
  }, [isOpen]);

  const fetchInitialMenu = async () => {
    setIsTyping(true);
    const raw = await sendToN8N({ text: "menu", user_id: session.user_id });
    setIsTyping(false);
    setMessages([buildBotMessage(raw)]);
  };

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(
          `chat_${session.user_id}`,
          JSON.stringify(messages)
        );
      } catch (e) {
        console.error("Failed to save messages:", e);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: messages.length > 5 ? "smooth" : "auto",
        block: "end",
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  return (
    <>
      <Toaster position="top-right" />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-6
              w-full h-full md:w-[410px] md:h-[580px]
              bg-white border shadow-xl z-50 flex flex-col rounded-lg md:rounded-2xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="bg-[rgb(0,6,90)] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={Logo1} alt="logo" className="w-20" />
                <div className="flex flex-col">
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full font-medium w-fit">
                    LIVE CHAT
                  </span>
                  {connectionError && (
                    <span className="text-xs bg-red-600 px-2 py-1 rounded-full font-medium w-fit mt-1">
                      OFFLINE
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectionError && (
                  <button
                    onClick={handleRetryConnection}
                    className="p-2 hover:bg-[rgb(0,10,120)] rounded-full transition-colors"
                    title="Retry connection"
                  >
                    <IoReload className="text-sm" />
                  </button>
                )}
                <button
                  onClick={handleClearChat}
                  className="p-2 hover:bg-[rgb(0,10,120)] rounded-full transition-colors"
                  title="Clear chat"
                >
                  <IoTrash className="text-sm" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[rgb(0,10,120)] rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <SlArrowDown />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div
              className="flex-1 p-4 overflow-y-auto bg-gray-50"
              role="log"
              aria-label="Chat messages"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="mb-4"
                  role="article"
                  aria-label={`Message from ${msg.sender}`}
                >
                  <div
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    } gap-2`}
                  >
                    {msg.sender === "bot" && (
                      <img
                        src={Logo8}
                        className="w-6 h-6 mt-1 flex-shrink-0"
                        alt="Bot avatar"
                      />
                    )}
                    <div
                      className={`p-3 max-w-[80%] rounded-2xl text-sm ${
                        msg.sender === "user"
                          ? "bg-[rgb(0,6,90)] text-white rounded-br-none"
                          : "bg-white border rounded-tl-none shadow-sm"
                      }`}
                    >
                      {renderMessage(msg)}
                      <div
                        className={`text-[10px] mt-1 ${
                          msg.sender === "user"
                            ? "text-blue-200"
                            : "text-gray-400"
                        } text-right`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 mb-4">
                  <img src={Logo8} className="w-5 h-5 mt-1" alt="Bot typing" />
                  <div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
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
              <div ref={bottomRef} aria-hidden="true" />
            </div>

            {/* CONNECTION ERROR BANNER */}
            {connectionError && (
              <div className="bg-red-50 border-t border-red-200 px-4 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Connection issues detected
                  </span>
                  <button
                    onClick={handleRetryConnection}
                    className="text-red-800 hover:text-red-900 font-medium text-xs underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* INPUT */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 border px-4 py-3 rounded-full text-sm focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent outline-none transition-all"
                  placeholder="Ask Ajani anything in Ibadan…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isTyping || isSending}
                  aria-label="Type your message"
                  aria-required="true"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || isSending}
                  className={`p-3 rounded-full text-white transition-all ${
                    input.trim() && !isTyping && !isSending
                      ? "bg-[rgb(0,6,90)] hover:bg-[rgb(0,10,120)] shadow-md"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <FiSend className={isSending ? "animate-pulse" : ""} />
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
