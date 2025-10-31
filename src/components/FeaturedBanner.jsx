// src/components/FeaturedBanner.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 🔑 CONFIG — Move to .env in production
const SHEET_ID = "1JZ_EiO9qP0Z74-OQXLrkhDNRh1JBZ68j-7yVjCR_PRY";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const RANGE = "Ads!A1:O";

const FeaturedBanner = () => {
  const [showModal, setShowModal] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed extra spaces in URL
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
          adContent: (
            <div className="text-center font-rubik">
              <img
                src={obj.image_url}
                alt={obj.modal_title || "Ad"}
                className="mx-auto mb-4 rounded-lg shadow-md max-h-48 object-cover w-full"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/300x200?text=Ad+Image";
                }}
              />
              <h3 className="text-xl font-bold text-gray-800">
                {obj.modal_title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {obj.modal_description}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                {obj.tag1 && (
                  <span className="bg-green-300 px-2 py-1 rounded-full">
                    {obj.tag1}
                  </span>
                )}
                {obj.tag2 && (
                  <span className="bg-yellow-300 px-2 py-1 rounded-full">
                    {obj.tag2}
                  </span>
                )}
                {obj.tag3 && (
                  <span className="bg-red-300 px-2 py-1 rounded-full">
                    {obj.tag3}
                  </span>
                )}
              </div>
              {obj.disclaimer && (
                <p className="mt-4 text-sm text-gray-500">{obj.disclaimer}</p>
              )}
              <div className="mt-6">
                <a
                  href={obj.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow"
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp Us
                </a>
              </div>
            </div>
          ),
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

  useEffect(() => {
    fetchAds();
  }, []);

  // ✅ Responsive slide-in from left (left → right)
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
    <section className="py-16 bg-gray-900 shadow-xl  text-white font-rubik my-5 overflow-hidden ">
      {/* ✅ Matched width: max-w-7xl + px-5 */}
      <div className=" max-w-6xl mx-auto px-4">
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

        {/* ✅ Grid with consistent padding */}
        <div className=" grid grid-cols-1 md:grid-cols-3 gap-6">
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
                activeAd.bgColor || "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>
              {activeAd.adContent}
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
    </section>
  );
};

export default FeaturedBanner;
