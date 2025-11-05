// src/components/FeaturedBanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hook/useAuth";
import AuthModal from "./ui/AuthModal";

const SHEET_ID = "1JZ_EiO9qP0Z74-OQXLrkhDNRh1JBZ68j-7yVjCR_PRY";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const RANGE = "Ads!A1:O";

const formatWhatsapp = (number) => {
  if (!number) return "";
  const digits = number.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(
      7
    )}`;
  }
  if (digits.length === 13 && digits.startsWith("234")) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(
      9
    )}`;
  }
  return `+${digits}`;
};

const FeaturedBanner = () => {
  const { user, loading: authLoading } = useAuth();
  const [showModal, setShowModal] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showContact, setShowContact] = useState({});
  const [imageLoading, setImageLoading] = useState({}); // ✅ Track image load state
  const contactTimeouts = useRef({});

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fixed: removed extra spaces in URL
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const rows = data.values;

      if (!rows || rows.length < 2) throw new Error("No ad data found");

      const headers = rows[0];
      const adRows = rows.slice(1);

      const parsedAds = adRows.map((row) => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || "";
        });

        return {
          id: obj.id,
          title: obj.title,
          subtitle: obj.subtitle,
          description: obj.description,
          button: obj.button,
          bgColor: obj.bgColor || "bg-white",
          buttonColor: obj.buttonColor || "bg-blue-600 hover:bg-blue-700",
          whatsappLink: obj.whatsapp_link || "",
          whatsapp: obj.whatsapp || "",
          modal_title: obj.modal_title || "",
          modal_description: obj.modal_description || "",
          image_url: obj.image_url || "",
          tag1: obj.tag1 || "",
          tag2: obj.tag2 || "",
          tag3: obj.tag3 || "",
          disclaimer: obj.disclaimer || "",
        };
      });

      setAds(parsedAds);
    } catch (err) {
      console.error("Failed to load ads:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleShowContact = (adId, whatsapp) => {
    if (authLoading) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setShowContact((prev) => ({ ...prev, [adId]: true }));

    if (contactTimeouts.current[adId]) {
      clearTimeout(contactTimeouts.current[adId]);
    }

    const timer = setTimeout(() => {
      setShowContact((prev) => ({ ...prev, [adId]: false }));
    }, 20000);

    contactTimeouts.current[adId] = timer;
  };

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (user && isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  }, [user, isAuthModalOpen]);

  const cardVariants = {
    hidden: { opacity: 0, x: "-20vw" },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.15,
      },
    }),
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-900 p-6 text-white font-rubik my-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <p>Loading featured businesses...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-900 p-6 text-white font-rubik my-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchAds}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const activeAd = ads.find((a) => a.id === showModal);

  return (
    <section className="py-16 bg-gray-900 shadow-xl text-white font-rubik my-5 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-left mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold mb-2"
          >
            Featured Businesses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 lg:text-[17px] text-sm"
          >
            Discover these sponsored listings from local businesses
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ads.map((ad, index) => (
            <motion.div
              key={ad.id || `ad-${index}`}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px 0px" }}
              className={`relative rounded-lg shadow-lg p-6 cursor-pointer transition-colors ${
                ad.bgColor.includes("white") ? "text-gray-800" : "text-gray-900"
              } ${ad.bgColor}`}
              onClick={() => setShowModal(ad.id)}
            >
              <div className="font-medium text-gray-500 mb-2">{ad.title}</div>
              <h3 className="text-lg font-semibold mb-2">{ad.subtitle}</h3>
              <p className="mb-4 text-sm opacity-90">{ad.description}</p>
              <button
                className={`px-4 py-2 rounded-lg font-semibold text-white transition ${ad.buttonColor}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(ad.id);
                }}
              >
                {ad.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && activeAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 text-center ${
                activeAd.bgColor.includes("white")
                  ? "text-gray-800"
                  : "text-white"
              } ${activeAd.bgColor}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>

              <div className="font-rubik">
                {/* ✅ Image with loading spinner */}
                <div className="relative w-full h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
                  {imageLoading[activeAd.id] !== false && (
                    <div className="flex flex-col items-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                      <p className="text-xs text-gray-600 mt-2">
                        Image loading...
                      </p>
                    </div>
                  )}
                  <img
                    src={activeAd.image_url}
                    alt={activeAd.modal_title || "Ad"}
                    className={`absolute inset-0 w-full h-full rounded-lg shadow-md object-cover transition-opacity duration-300 ${
                      imageLoading[activeAd.id] === false
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                    onLoad={() =>
                      setImageLoading((prev) => ({
                        ...prev,
                        [activeAd.id]: false,
                      }))
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/300x200?text=Ad+Image";
                      setImageLoading((prev) => ({
                        ...prev,
                        [activeAd.id]: false,
                      }));
                    }}
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {activeAd.modal_title}
                </h3>
                <p className="mt-2 text-sm opacity-90 text-gray-900">
                  {activeAd.modal_description}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                  {activeAd.tag1 && (
                    <span className="bg-green-300 px-2 py-1 rounded-full">
                      {activeAd.tag1}
                    </span>
                  )}
                  {activeAd.tag2 && (
                    <span className="bg-yellow-300 px-2 py-1 rounded-full">
                      {activeAd.tag2}
                    </span>
                  )}
                  {activeAd.tag3 && (
                    <span className="bg-red-300 px-2 py-1 rounded-full">
                      {activeAd.tag3}
                    </span>
                  )}
                </div>
                {activeAd.disclaimer && (
                  <p className="mt-4 text-sm text-gray-500">
                    {activeAd.disclaimer}
                  </p>
                )}

                <div className="mt-6">
                  {showContact[activeAd.id] ? (
                    <div className="bg-green-100 p-3 rounded-lg inline-block">
                      <span className="text-gray-800 font-medium">
                        📞 {formatWhatsapp(activeAd.whatsapp) || "N/A"}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            formatWhatsapp(activeAd.whatsapp) || ""
                          );
                          alert("Number copied to clipboard!");
                        }}
                        className="ml-2 px-2 py-1 bg-green-700 text-white rounded text-xs"
                      >
                        <i className="fas fa-copy"></i> Copy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowContact(activeAd.id, activeAd.whatsapp);
                      }}
                      disabled={authLoading}
                      className="flex w-full items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow"
                    >
                      {authLoading ? (
                        <span className="h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <i className="fab fa-whatsapp"></i>{" "}
                          {activeAd.whatsapp ? "Show Contact" : "WhatsApp Us"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthToast={(msg) => console.log("Auth toast:", msg)}
        />
      )}
    </section>
  );
};

export default FeaturedBanner;
