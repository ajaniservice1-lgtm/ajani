import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";
import { useLocation } from "../hook/useLocation";

const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

let lastQueryContext = null;

// Normalize for robust matching: lowercase + alpha-numeric only
const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const hasSentWelcome = useRef(false);
  const currentPageRef = useRef(0);
  const lastFetchedBusinessesRef = useRef([]);

  const { location, requestLocation, getDistance: distanceFn } = useLocation();

  // === Keyword Variants Map (base → [singular, plural, common typos]) ===
  const keywordVariants = {
    hotel: ["hotel", "hotels", "hotele", "hotell"],
    hostel: ["hostel", "hostels"],
    lodge: ["lodge", "lodges"],
    accommodation: [
      "accommodation",
      "accommodations",
      "accommo",
      "acomodation",
    ],
    restaurant: ["restaurant", "restaurants", "resturant", "restaurent"],
    cafe: ["cafe", "cafes", "café", "cafee"],
    eat: ["eat", "eats", "eating"],
    food: ["food", "foods", "foood"],
    amala: ["amala", "amala food", "amala meal"],
    jollofrice: ["jollofrice", "jollof rice", "jollof", "jollof-rice"],
    shortlet: ["shortlet", "shortlets"],
    dine: ["dine", "dines", "dining"],
    meal: ["meal", "meals"],
    event: ["event", "events"],
    party: ["party", "parties"],
    wedding: ["wedding", "weddings"],
    hall: ["hall", "halls"],
    services: ["service", "services", "servies", "serivces", "servise"],
    cleaning: ["cleaning", "clean", "cleans", "cleaner"],
    laundry: ["laundry", "laundries", "loundry"],
    repair: ["repair", "repairs", "repaire", "reapir"],
  };

  // === Parse user query with flexible matching ===
  const parseQuery = (question) => {
    const lowerQ = question.toLowerCase();
    const normalizedQ = normalize(lowerQ);

    let category = null;

    for (const [base, variants] of Object.entries(keywordVariants)) {
      for (const variant of variants) {
        const normVariant = normalize(variant);
        if (normalizedQ.includes(normVariant)) {
          category = base;
          break;
        }
      }
      if (category) break;
    }

    if (!category) return null;

    const isMostExpensive = /most expensive|expensive/i.test(lowerQ);
    const isCheapest =
      /cheapest|lowest|affordable|budget|inexpensive|less than/i.test(lowerQ) &&
      !isMostExpensive;

    const inMatch = lowerQ.match(
      /\b(?:in|around|close to|inside|at)\s+([a-z\s]+)/i
    );
    const underMatch = lowerQ.match(/(under|below|less than)\s*([\d,]+)/i);
    const overMatch = lowerQ.match(/(over|above|more than)\s*([\d,]+)/i);

    return {
      category,
      area: inMatch?.[1]?.trim() || null,
      sortOrder: isMostExpensive ? "desc" : "asc",
      minPrice: overMatch ? parseFloat(overMatch[2].replace(/,/g, "")) : null,
      maxPrice: underMatch ? parseFloat(underMatch[2].replace(/,/g, "")) : null,
      isNearMe: /near me/i.test(lowerQ),
      isCheapest, // ✅ new flag
    };
  };

  // === Fetch and build response ===
  const fetchAnswerFromSheet = async (query) => {
    const {
      category,
      area,
      sortOrder,
      minPrice,
      maxPrice,
      isNearMe,
      isCheapest,
    } = query;

    // ✅ FIXED: Removed extra spaces in URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Catalog!A2:L1000?key=${API_KEY}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows = data.values || [];

      let businesses = rows
        .filter((row) => row.length >= 6 && row[5])
        .map(([id, name, cat, ar, desc, pf, cur, ph, wa, addr, lat, lon]) => ({
          id: parseInt(id) || 0,
          name: name || "Unnamed",
          category: (cat || "").toLowerCase(),
          area: (ar || "").toLowerCase(),
          short_desc: desc || "",
          price_from: pf ? parseFloat(pf) : null,
          phone: ph || "",
          whatsapp: wa || "",
          address: addr || "",
          lat: lat ? parseFloat(lat) : null,
          lon: lon ? parseFloat(lon) : null,
        }))
        .filter(
          (b) =>
            b.price_from &&
            !isNaN(b.price_from) &&
            normalize(b.category).includes(normalize(category))
        );

      lastFetchedBusinessesRef.current = businesses;

      // Price filters
      if (minPrice !== null)
        businesses = businesses.filter((b) => b.price_from >= minPrice);
      if (maxPrice !== null)
        businesses = businesses.filter((b) => b.price_from <= maxPrice);

      // Area filter
      if (area) {
        let normalizedArea = area.toLowerCase().trim();
        normalizedArea = normalizedArea
          .replace(/\b(in|area|around|close to|inside|at|near)\b/g, "")
          .replace(/[.,]/g, "")
          .trim();

        const ibadanAliases = ["ibadan", "ib city", "oyo", "ibd"];
        if (!ibadanAliases.some((kw) => normalizedArea.includes(kw))) {
          const words = normalizedArea.split(/\s+/);
          const possibleAreas = words.filter(
            (w) =>
              !ibadanAliases.includes(w) && w.length > 2 && /^[a-z]+$/.test(w)
          );

          if (possibleAreas.length > 0) {
            businesses = businesses.filter((b) =>
              possibleAreas.some((w) => b.area.includes(w))
            );
          } else {
            businesses = businesses.filter((b) =>
              b.area.includes(normalizedArea)
            );
          }
        }
      }

      // Near me + sort
      if (isNearMe && location) {
        businesses = businesses
          .filter((b) => b.lat && b.lon)
          .map((b) => ({
            ...b,
            distance: distanceFn(location.lat, location.lon, b.lat, b.lon),
          }))
          .filter((b) => b.distance <= 15)
          .sort((a, b) => a.distance - b.distance);
      } else {
        businesses.sort((a, b) =>
          sortOrder === "desc"
            ? b.price_from - a.price_from
            : a.price_from - b.price_from
        );
      }

      // Pagination
      const batchSize = 5;
      const start = currentPageRef.current * batchSize;
      const end = start + batchSize;
      const batch = businesses.slice(start, end);

      if (!batch.length) {
        currentPageRef.current = 0;
        return "No results at the moment. That’s all available for now 😊";
      }

      // ✅ Reply builder: natural phrasing
      let prefix = "";
      if (sortOrder === "desc") {
        prefix = "most expensive ";
      } else if (isCheapest) {
        prefix = "cheapest ";
      } else {
        prefix = ""; // neutral
      }

      let reply = `Here are the ${prefix}${category}`;
      if (area) reply += ` in **${area}**`;
      if (isNearMe) reply += ` near you`;
      if (minPrice !== null) reply += ` above ₦${minPrice.toLocaleString()}`;
      if (maxPrice !== null) reply += ` under ₦${maxPrice.toLocaleString()}`;
      reply += `:\n\n`;

      batch.forEach((b, i) => {
        const idx = start + i + 1;
        reply += `${idx}. **${b.name}**\n   📍 ${
          b.area.charAt(0).toUpperCase() + b.area.slice(1)
        }\n   💰 ₦${b.price_from.toLocaleString()}\n   🔗 [Copy →](${
          b.name
        })\n\n`;
      });

      if (end < businesses.length) {
        reply += `👉 Type "**more**" for next 5.`;
      } else {
        reply += `✅ That’s all available! 😊`;
      }

      return reply;
    } catch (err) {
      console.error("Sheets fetch error:", err);
      return "Ajani is having trouble fetching data. Please try again!";
    }
  };

  // === Handle message send ===
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    let reply = null;
    if (input.trim().toLowerCase() === "more" && lastQueryContext) {
      currentPageRef.current += 1;
      reply = await fetchAnswerFromSheet(lastQueryContext);
    } else {
      currentPageRef.current = 0;
      const parsed = parseQuery(input);
      if (parsed) {
        if (parsed.isNearMe && !location) {
          try {
            await requestLocation();
          } catch {}
        }
        lastQueryContext = { ...parsed, location };
        reply = await fetchAnswerFromSheet({ ...parsed, location });
      } else {
        reply = /\b(hi|hello|hey)\b/i.test(input)
          ? "Hi 👋 I'm Ajani! Try: 'hotels under 10000' or 'restaurants in Bodija'."
          : "Ajani didn’t understand. Try: 'cheapest hotels', 'food under 1000 in Bodija', or 'events near me'.";
      }
    }

    setMessages((p) => [...p, { sender: "bot", text: reply }]);
    toast.success("Ajani replied!");
    setIsTyping(false);
  };

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

  // === UI Animation ===
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
            <div className="bg-[rgb(0,6,90)] text-white p-3 flex justify-between items-center">
              <span className="font-medium">💬 Ask Ajani</span>
              <button onClick={onClose} className="text-white text-lg">
                ×
              </button>
            </div>

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
                    {msg.text.split("\n").map((line, idx) => {
                      const match = line.match(/\[Copy →\]\(([^)]+)\)/);
                      if (match) {
                        const name = match[1];
                        return (
                          <span key={idx}>
                            {line.substring(0, match.index)}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(name);
                                toast.success(
                                  `Copied “${name}”! Paste in directory for more details.`
                                );
                              }}
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              Copy Name
                            </button>
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

              {isTyping && (
                <p className="text-gray-500 italic text-sm">
                  Ajani is typing...
                </p>
              )}
            </div>

            <div className="p-2 border-t bg-white flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="E.g., cheapest hotels"
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
