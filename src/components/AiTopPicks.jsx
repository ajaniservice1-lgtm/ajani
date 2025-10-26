import React, { useState, useEffect } from "react";
import { useDirectoryData } from "../hook/useDirectoryData";
import { motion } from "framer-motion";

const FALLBACK_IMAGES = {
  "food-default":
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "hotel-default":
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "event-default":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default: "https://via.placeholder.com/300x200?text=No+Image",
};

const getCardImage = (item) => {
  const sheetImage = (item["image url"] || "").trim();
  if (sheetImage && sheetImage.startsWith("http")) return sheetImage;
  if (item.category?.includes("food")) return FALLBACK_IMAGES["food-default"];
  if (item.category?.includes("hotel")) return FALLBACK_IMAGES["hotel-default"];
  if (item.category?.includes("event")) return FALLBACK_IMAGES["event-default"];
  return FALLBACK_IMAGES["default"];
};

const formatTags = (tagString) => {
  if (!tagString) return [];
  return tagString.split(",").map((tag) => {
    const [name, price] = tag.trim().split(":");
    if (price) {
      const num = parseInt(price);
      return `${name}: ₦${num.toLocaleString()}`;
    }
    return name;
  });
};

const TruncatedText = ({ text, maxLines = 4 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text.length < 200) {
    return <p className="text-slate-700 text-sm mb-3">{text}</p>;
  }
  return (
    <div className="relative">
      <p
        className={`text-slate-700 text-sm mb-3 ${
          isExpanded ? "" : "line-clamp-4"
        }`}
        style={{
          WebkitLineClamp: isExpanded ? "unset" : maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
        }}
      >
        {text}
      </p>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-[#3276ee] text-sm font-medium hover:underline mt-1 block"
        >
          See More...
        </button>
      ) : (
        <button
          onClick={() => setIsExpanded(false)}
          className="text-blue-600 text-sm font-medium hover:underline mt-1 block"
        >
          See Less
        </button>
      )}
    </div>
  );
};

const sectionVariant = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      staggerChildren: 0.12,
      when: "beforeChildren",
      duration: 0.6,
    },
  },
};

const titleVariant = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" },
  }),
};

const cardsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.18 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const AiTopPicks = () => {
  const SHEET_ID = import.meta.env.VITE_SHEET_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { listings = [], loading, error } = useDirectoryData(SHEET_ID, API_KEY);

  const topPicks = (Array.isArray(listings) ? listings : [])
    .filter((item) => item.is_featured?.toLowerCase() === "yes")
    .slice(0, 3);

  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !showContent) {
    return (
      <section className="bg-slate-100 py-16 font-rubik">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Top picks data is loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-slate-100 py-16 font-rubik">
        <div className="max-w-7xl mx-auto px-5 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  if (topPicks.length === 0) return null;

  return (
    <motion.section
      id="toppicks"
      className="bg-[#eef8fd] py-16 font-rubik"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionVariant}
    >
      <div className="max-w-7xl mx-auto px-5">
        <motion.div className="text-center mb-12">
          <motion.h2
            className="text-3xl font-bold mb-2"
            custom={0}
            variants={titleVariant}
          >
            Ajani's Top Picks for You
          </motion.h2>
          <motion.p
            className="text-slate-600 text-sm"
            custom={1}
            variants={titleVariant}
          >
            Verified recommendations based on popular queries
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={cardsContainer}
        >
          {topPicks.map((card, i) => (
            <motion.article
              key={card.id || i}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
              variants={cardVariant}
              whileHover={{
                y: -6,
                boxShadow: "0 12px 30px rgba(8,22,63,0.12)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 28 }}
              viewport={{ once: true }}
            >
              <h3 className="font-bold text-lg mb-2 text-slate-800">
                {card.name}
              </h3>

              <motion.div
                className="w-full h-40 overflow-hidden rounded mb-3"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <img
                  src={getCardImage(card)}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
              </motion.div>

              <TruncatedText text={card.short_desc} maxLines={4} />

              <div className="flex flex-wrap gap-2 mb-6">
                {formatTags(card.tags).map((tag, j) => (
                  <span
                    key={j}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={`https://wa.me/${(card.whatsapp || "").replace(
                  /\D/g,
                  ""
                )}?text=Hi%20Ajani%20👋`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-lg transition"
              >
                Ask Ajani
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AiTopPicks;
