// src/components/AiTopPicks.jsx
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useDirectoryData } from "../hook/useDirectoryData";
import { useAuth } from "../hook/useAuth";
import AuthModal from "./ui/AuthModal";
import ImageModal from "./ImageModal";
import { useChat } from "../context/ChatContext";
import { useModal } from "../context/ModalContext";

// ---------------- Fallback Images ----------------
const FALLBACK_IMAGES = {
  food: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  hotel:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  event:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default: "https://via.placeholder.com/300x200?text=No+Image",
};

const getCardImages = (item) => {
  const raw = item["image url"] || "";
  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u && u.startsWith("http"));

  if (urls.length > 0) return urls;

  const cat = (item.category || "").toLowerCase();
  if (cat.includes("food")) return [FALLBACK_IMAGES.food];
  if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  return [FALLBACK_IMAGES.default];
};

const formatTags = (tagString) =>
  tagString
    ? tagString.split(",").map((tag) => {
        const [name, price] = tag.trim().split(":");
        return price ? `${name}: ₦${parseInt(price).toLocaleString()}` : name;
      })
    : [];

// ---------------- Animation Wrapper ----------------
const AppleCardWrapper = ({ children, index }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, delay: index * 0.1, ease: "easeOut" },
      });
    } else {
      controls.start({ opacity: 0, y: 40, scale: 0.98 });
    }
  }, [inView, controls, index]);

  return (
    <motion.div ref={ref} animate={controls} initial={{ opacity: 0, y: 40 }}>
      {children}
    </motion.div>
  );
};

// ---------------- Image Carousel ----------------
const ImageCarousel = ({ card, onImageClick }) => {
  const images = getCardImages(card);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timeout = setTimeout(
      () => setIndex((prev) => (prev + 1) % images.length),
      4000
    );
    return () => clearTimeout(timeout);
  }, [index, images.length]);

  return (
    <div
      className="relative w-full h-44 md:h-52 overflow-hidden rounded-t-xl bg-gray-100 cursor-pointer"
      onClick={() => onImageClick(images, index)}
    >
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "tween", duration: 0.5 }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${card.name || "Business"} image ${i + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
            loading="lazy"
          />
        ))}
      </motion.div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? "bg-white scale-125" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------- Single Card ----------------
const Card = ({ card, index, onShowContact, onImageClick }) => {
  const { user, loading: authLoading } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatWhatsapp = (num) => {
    if (!num) return "";
    const digits = num.replace(/\D/g, "");
    if (digits.startsWith("0") && digits.length === 11)
      return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(
        7
      )}`;
    if (digits.startsWith("234") && digits.length === 13)
      return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(
        9
      )}`;
    return digits;
  };

  const handleShowContact = () => {
    if (authLoading) return;
    if (!user) return onShowContact(); // open auth modal if not logged in
    setShowContact(true);
    setTimeout(() => setShowContact(false), 20000);
  };

  const desc = card.short_desc || "";
  const isLong = desc.length > 110;
  const displayText = expanded
    ? desc
    : `${desc.slice(0, 110)}${isLong ? "..." : ""}`;

  return (
    <AppleCardWrapper index={index}>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
        <ImageCarousel card={card} onImageClick={onImageClick} />
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{card.name}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {displayText}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-700 font-semibold ml-1"
              >
                {expanded ? "See less" : "Read more"}
              </button>
            )}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {formatTags(card.tags).map((tag, j) => (
              <span
                key={j}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto">
            {!showContact ? (
              <button
                onClick={handleShowContact}
                className="w-full flex items-center justify-center gap-2 bg-[rgb(0,6,90)] hover:bg-[#0e1f45] text-white py-2.5 rounded-lg font-semibold text-sm"
              >
                <FontAwesomeIcon icon={faComment} />
                Show Contact
              </button>
            ) : (
              <div className="flex items-center justify-between bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                <span>📞 {formatWhatsapp(card.whatsapp) || "No number"}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(card.whatsapp || "");
                    alert("Copied!");
                  }}
                  className="ml-2 bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                >
                  <FontAwesomeIcon icon={faCopy} /> Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppleCardWrapper>
  );
};

// ---------------- Main Component ----------------
const AiTopPicks = ({ onAuthToast }) => {
  const {
    listings = [],
    loading,
    error,
  } = useDirectoryData(
    import.meta.env.VITE_SHEET_ID,
    import.meta.env.VITE_GOOGLE_API_KEY
  );

  const { openChat } = useChat();
  const { openModal, closeModal } = useModal(); // ✅ modal context

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const topPicks = listings
    .filter((i) => i.is_featured?.toLowerCase() === "yes")
    .slice(0, 3);

  if (loading)
    return (
      <section className="py-16 text-center font-rubik bg-[#eef8fd]">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading top picks...</p>
      </section>
    );

  if (error)
    return (
      <section className="py-16 text-center text-red-500 font-rubik">
        {error}
      </section>
    );

  if (!topPicks.length) return null;

  const handleAuthModalOpen = () => {
    openModal();
    setAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    closeModal();
    setAuthModalOpen(false);
  };

  const handleImageModalOpen = (images, idx) => {
    openModal();
    setImageModal({ isOpen: true, images, initialIndex: idx });
  };

  const handleImageModalClose = () => {
    closeModal();
    setImageModal({ isOpen: false, images: [], initialIndex: 0 });
  };

  return (
    <>
      <section className="bg-[#eef8fd] py-16 font-rubik" id="toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={
                headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                animate={headerInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-3xl font-bold text-gray-900 border-b-4 border-blue-800 inline-block pb-2"
              >
                Ajani’s Top Picks for You
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={headerInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-gray-600 text-sm mt-2"
              >
                Verified recommendations based on popular queries
              </motion.p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPicks.map((card, i) => (
              <Card
                key={i}
                card={card}
                index={i}
                onShowContact={handleAuthModalOpen}
                onImageClick={handleImageModalOpen}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={handleAuthModalClose}
          onAuthToast={onAuthToast}
        />
      )}

      {imageModal.isOpen && (
        <ImageModal
          images={imageModal.images}
          initialIndex={imageModal.initialIndex}
          onClose={handleImageModalClose}
          onAuthToast={() => {}}
          onOpenChat={openChat}
        />
      )}
    </>
  );
};

export default AiTopPicks;
