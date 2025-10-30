// src/components/AiTopPicks.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useDirectoryData } from "../hook/useDirectoryData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCopy } from "@fortawesome/free-solid-svg-icons";
import AuthModal from "./ui/AuthModal";
import { useAuth } from "../hook/useAuth";

// ✅ FIXED: Removed leading/trailing spaces in all URLs
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
  return FALLBACK_IMAGES.default;
};

const formatTags = (tagString) => {
  if (!tagString) return [];
  return tagString.split(",").map((tag) => {
    const [name, price] = tag.trim().split(":");
    if (price) return `${name}: ₦${parseInt(price).toLocaleString()}`;
    return name;
  });
};

const formatPhoneNumber = (number) => {
  if (!number) return "";
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(
      7
    )}`;
  } else if (digits.startsWith("234") && digits.length === 13) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(
      9
    )}`;
  }
  return digits;
};

const TruncatedText = ({ text, maxLines = 4 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text.length < 200)
    return <p className="text-slate-700 text-sm mb-3">{text}</p>;
  return (
    <div className="relative">
      <p
        className={`text-slate-700 text-sm mb-3 ${
          isExpanded ? "" : "line-clamp-4"
        }`}
        style={{
          WebkitLineClamp: isExpanded ? "unset" : maxLines,
          WebkitBoxOrient: "vertical",
          display: "-webkit-box",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {text}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 text-sm font-medium hover:underline mt-1 block"
      >
        {isExpanded ? "See Less" : "See More..."}
      </button>
    </div>
  );
};

// ---------------- Animation Variants ----------------
// ✅ ADDED: These were missing!
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

// ---------------- Card Component ----------------
const Card = ({ card, index, onShowContact, onAuthToast }) => {
  const { user, loading: authLoading } = useAuth();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  const [showContact, setShowContact] = useState(false);

  const handleShowContact = () => {
    if (authLoading) return;
    if (!user) {
      onShowContact();
      return;
    }
    setShowContact(true);
    setTimeout(() => setShowContact(false), 20000);
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 30, filter: "blur(6px)" }
      }
      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.15 }}
      whileHover={{ y: -6, boxShadow: "0 12px 30px rgba(8,22,63,0.12)" }}
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-full"
    >
      <h3 className="font-bold text-lg mb-2 text-slate-800">{card.name}</h3>
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

      {/* ✅ Tags now wrap safely */}
      <div className="flex flex-wrap gap-2 mb-6 min-w-0">
        {formatTags(card.tags).map((tag, j) => (
          <span
            key={j}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium whitespace-normal break-words"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-2">
        {authLoading ? (
          <div className="flex-1 bg-gray-200 animate-pulse h-10 rounded-lg" />
        ) : !showContact ? (
          <button
            onClick={handleShowContact}
            className="flex items-center justify-center gap-2 bg-[rgb(0,6,90)] hover:bg-[#0e1f45] text-white px-4 py-2 rounded-lg font-semibold text-sm flex-1"
          >
            <FontAwesomeIcon icon={faComment} /> Show Contact
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-between bg-green-100 px-3 py-2 rounded text-sm font-medium">
            <span>
              📞 {formatPhoneNumber(card.whatsapp) || "No number available"}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(card.whatsapp || "");
                alert("Number copied to clipboard!");
              }}
              className="ml-2 px-2 py-1 bg-green-700 text-white rounded text-xs flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faCopy} /> Copy
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
};

// ---------------- AiTopPicks Component ----------------
const AiTopPicks = ({ onAuthToast }) => {
  const SHEET_ID = import.meta.env.VITE_SHEET_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { listings = [], loading, error } = useDirectoryData(SHEET_ID, API_KEY);

  const topPicks = (Array.isArray(listings) ? listings : [])
    .filter((item) => item.is_featured?.toLowerCase() === "yes")
    .slice(0, 3);

  const [showContent, setShowContent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !showContent)
    return (
      <section className="bg-slate-100 py-16 font-rubik">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Top picks data is loading...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="bg-slate-100 py-16 font-rubik">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-red-500">
          {error}
        </div>
      </section>
    );

  if (topPicks.length === 0) return null;

  return (
    <>
      <motion.section
        id="toppicks"
        className="bg-[#eef8fd] py-16 font-rubik"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        variants={sectionVariant} // ✅ Now defined!
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold mb-2"
              custom={0}
              variants={titleVariant} // ✅ Now defined!
            >
              Ajani's Top Picks for You
            </motion.h2>
            <motion.p
              className="text-slate-600 text-sm"
              custom={1}
              variants={titleVariant} // ✅ Now defined!
            >
              Verified recommendations based on popular queries
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPicks.map((card, i) => (
              <Card
                key={card.id || i}
                card={card}
                index={i}
                onShowContact={() => setIsModalOpen(true)}
                onAuthToast={onAuthToast}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Global Auth Modal */}
      {isModalOpen && (
        <AuthModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAuthToast={onAuthToast}
        />
      )}
    </>
  );
};

export default AiTopPicks;
