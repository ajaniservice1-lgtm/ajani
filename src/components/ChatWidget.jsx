// src/components/ChatWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";
import { useLocation } from "../hook/useLocation"; // ✅ External hook

const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

let lastQueryContext = null;

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const hasSentWelcome = useRef(false);
  const currentPageRef = useRef(0);

  const {
    location,
    loading: loadingLoc,
    error: locError,
    requestLocation,
    getDistance,
  } = useLocation();

  // === Static responses ===
  const staticQnA = {
    hello:
      "Hi 👋 I'm Ajani! An automated assistant — I'm still learning! Try: 'hotels under 10000' or 'restaurants in Bodija'.",
    hi: "Hello! 👋 Ask me about Ibadan businesses. Try: 'hotels near me under 10000'.",
    help: "Examples:\n• “Hotels under 15000”\n• “Food near me”\n• “Event halls in Mokola”",
    phone: "📞 Go to directory for contact details.",
    contact: "📞 Go to directory for contact details.",
    more: "First ask a question like “hotels”, then say “more”.",
  };

  const getStaticResponse = (question) => {
    const key = question.toLowerCase().trim();
    for (const [q, a] of Object.entries(staticQnA)) {
      if (key.includes(q)) return a;
    }
    return null;
  };

  // === Parse user query ===
  const parseQuery = (question) => {
    const lowerQ = question.toLowerCase();
    const keywords = [
      "hotel",
      "hostel",
      "lodge",
      "accommodation",
      "restaurant",
      "restaurants",
      "cafe",
      "eat",
      "food",
      "amala",
      "jollofrice",
      "shortlet",
      "dine",
      "meal",
      "event",
      "party",
      "wedding",
      "celebration",
      "hall",
      "services",
      "service",
      "cleaning",
      "laundry",
      "repair",
    ];

    let category = null;
    for (const kw of keywords) {
      if (lowerQ.includes(kw)) {
        category = kw;
        break;
      }
    }
    if (!category) return null;

    const isMostExpensive = /most expensive|highest price|expensive/i.test(
      lowerQ
    );
    const sortOrder = isMostExpensive ? "desc" : "asc";

    let area = null;
    const inMatch = lowerQ.match(/in\s+([a-z\s]+)/i);
    if (inMatch) area = inMatch[1].trim();

    let minPrice = null;
    let maxPrice = null;
    const underMatch = lowerQ.match(
      /(under|below|less than)\s*[₦]?\s*([\d,]+)/i
    );
    if (underMatch) maxPrice = parseFloat(underMatch[2].replace(/,/g, ""));

    const overMatch = lowerQ.match(/(over|above|more than)\s*[₦]?\s*([\d,]+)/i);
    if (overMatch) minPrice = parseFloat(overMatch[2].replace(/,/g, ""));

    const isNearMe = /near me|close to me|around me/i.test(lowerQ);

    return { category, area, sortOrder, minPrice, maxPrice, isNearMe };
  };

  // === Fetch from Google Sheets ===
  const fetchAnswerFromSheet = async (query) => {
    const { category, area, sortOrder, minPrice, maxPrice, isNearMe } = query;

    // ✅ FIXED: No extra spaces in URL
    const range = "Catalog!A2:L1000";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const rows = data.values || [];

      let businesses = rows
        .filter((row) => row.length >= 12)
        .map(
          ([
            id,
            name,
            cat,
            ar,
            short_desc,
            price_from,
            currency,
            phone,
            whatsapp,
            address,
            lat,
            lon,
          ]) => ({
            id,
            name: name || "Unnamed",
            category: (cat || "").toLowerCase(),
            area: (ar || "").toLowerCase(),
            price_from: price_from ? parseFloat(price_from) : null,
            currency: currency || "NGN",
            link: lon || "",
            lat: lat ? parseFloat(lat) : null,
            lon: lon ? parseFloat(lon) : null,
          })
        )
        .filter((b) => b.price_from !== null && !isNaN(b.price_from))
        .filter((b) => b.category.includes(category));

      // Apply price filters
      if (minPrice !== null)
        businesses = businesses.filter((b) => b.price_from >= minPrice);
      if (maxPrice !== null)
        businesses = businesses.filter((b) => b.price_from <= maxPrice);

      // Apply area filter
      if (area) {
        const areaLower = area.toLowerCase();
        businesses = businesses.filter((b) => b.area.includes(areaLower));
      }

      // Apply "near me" filter
      if (isNearMe && location) {
        businesses = businesses
          .filter((b) => b.lat && b.lon)
          .map((b) => ({
            ...b,
            distance: getDistance(location.lat, location.lon, b.lat, b.lon),
          }))
          .filter((b) => b.distance <= 15); // Max 15km
      }

      if (businesses.length === 0) {
        if (isNearMe && !location) {
          return "📍 First, allow location access. Try asking again after granting permission!";
        }
        if (isNearMe && location) {
          return `No ${category} found within 15km. Try without “near me”.`;
        }
        return `No matching ${category} found. Try: “hotels under 20000” or “food in Bodija”.`;
      }

      // Sort: nearest first (if near me), otherwise by price
      if (isNearMe && location) {
        businesses.sort((a, b) => a.distance - b.distance);
      } else {
        businesses.sort((a, b) =>
          sortOrder === "desc"
            ? b.price_from - a.price_from
            : a.price_from - b.price_from
        );
      }

      // Paginate
      const batchSize = 5;
      const start = currentPageRef.current * batchSize;
      const end = start + batchSize;
      const batch = businesses.slice(start, end);

      if (batch.length === 0) {
        currentPageRef.current = 0;
        return "That’s all available for now 😊";
      }

      // Format reply
      let reply = `Here are ${
        sortOrder === "desc" ? "most expensive " : ""
      }${category}`;
      if (area) reply += ` in **${area}**`;
      if (isNearMe) reply += ` near you`;
      if (minPrice !== null) reply += ` above ₦${minPrice.toLocaleString()}`;
      if (maxPrice !== null) reply += ` under ₦${maxPrice.toLocaleString()}`;
      reply += `:\n\n`;

      batch.forEach((b, i) => {
        const idx = start + i + 1;
        const formattedArea = b.area.charAt(0).toUpperCase() + b.area.slice(1);
        reply += `${idx}. **${b.name}**\n   📍 ${formattedArea}`;
        if (isNearMe && b.distance !== undefined) {
          reply += ` (${b.distance.toFixed(1)} km)`;
        }
        reply += `\n   💰 ₦${b.price_from.toLocaleString()}\n`;
        if (b.link) reply += `   🔗 [View →](${b.link})\n`;
        reply += "\n";
      });

      reply += "📞 *Go to directory for contact details.*\n\n";

      if (end < businesses.length) {
        reply += `👉 Type "**more**" for next 5.`;
      } else {
        reply += `✅ That’s all available! 😊`;
      }

      return reply;
    } catch (err) {
      console.error("Google Sheets error:", err);
      return "Ajani is having trouble fetching data. Please try again!";
    }
  };

  // === Handle send ===
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    let reply = null;
    const isMore = input.trim().toLowerCase() === "more";

    if (isMore && lastQueryContext) {
      currentPageRef.current += 1;
      reply = await fetchAnswerFromSheet(lastQueryContext);
    } else {
      currentPageRef.current = 0;
      const parsed = parseQuery(input);
      if (parsed) {
        const { isNearMe } = parsed;
        if (isNearMe && !location) {
          try {
            await requestLocation();
            lastQueryContext = { ...parsed, location: { lat: 0, lon: 0 } }; // dummy to prevent re-request
            reply = await fetchAnswerFromSheet({ ...parsed, location });
          } catch (err) {
            reply =
              "📍 Location access needed. You can still search by area (e.g., 'in Bodija').";
          }
        } else {
          lastQueryContext = { ...parsed, location };
          reply = await fetchAnswerFromSheet({ ...parsed, location });
        }
      } else {
        reply = getStaticResponse(input);
      }
    }

    if (!reply) {
      reply =
        "Ajani didn’t understand. Try:\n• “Hotels near me”\n• “Food under 1000 in Bodija”\n• “Most expensive event halls”";
    }

    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    toast.success("Ajani replied!");
    setIsTyping(false);
  };

  // === Welcome message ===
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
      const welcomeText = `${greeting} I'm Ajani 👋\n\nAsk about hotels, food, or events in Ibadan!\nExamples:\n• “Hotels near me”\n• “Restaurants in Bodija under 1000”\n• “Most expensive event halls”`;
      setMessages((prev) => [...prev, { sender: "bot", text: welcomeText }]);
      hasSentWelcome.current = true;
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setInput("");
    }
  }, [isOpen]);

  // === UI ===
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[320px] h-[384px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex justify-between items-center">
              <span className="font-medium">💬 Ask Ajani</span>
              <button onClick={onClose} className="text-white text-lg">
                ✕
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Try: “hotels near me”, “food under 1k in Bodija”
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
                      {msg.text.split("\n").map((line, idx) => {
                        const match = line.match(
                          /\[View →\]\((https?:\/\/.+?)\)/
                        );
                        if (match) {
                          return (
                            <span key={idx}>
                              {line.substring(0, match.index)}
                              <a
                                href={match[1]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                View →
                              </a>
                              <br />
                            </span>
                          );
                        }
                        return (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        );
                      })}
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

            <div className="p-2 border-t bg-white flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="E.g., hotels near me under 10000"
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
    </>
  );
};

export default ChatWidget;
