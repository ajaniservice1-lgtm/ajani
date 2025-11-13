// src/components/BusinessDetailModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faCopy,
  faStar,
  faMapMarkerAlt,
  faPhone,
  faWhatsapp,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hook/useAuth";
import AuthModal from "./ui/AuthModal";
import ImageCarousel from "./ImageCarousel"; // Reuse from Directory

const BusinessDetailModal = ({ isOpen, item, onClose }) => {
  const { user } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset contact visibility on close
  useEffect(() => {
    if (!isOpen) {
      setShowContact(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleShowContact = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setShowContact(true);
    setTimeout(() => setShowContact(false), 20000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (n) => (n ? Number(n).toLocaleString() : "–");
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

  if (!item) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[rgb(0,6,90)] text-white p-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
                    <span>{item.area}</span>
                    {item.lat && item.lon && (
                      <span>
                        • 📍 {parseFloat(item.lat).toFixed(4)},{" "}
                        {parseFloat(item.lon).toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white text-2xl hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Image Carousel */}
              <div className="h-64">
                <ImageCarousel card={item} onImageClick={() => {}} />
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Category & Rating */}
                <div className="flex justify-between items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {item.category}
                  </span>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500"
                      />
                      <span className="font-medium">{item.rating}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.short_desc && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{item.short_desc}</p>
                  </div>
                )}

                {/* Pricing */}
                <div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <div className="font-bold text-lg">
                    From ₦{formatPrice(item.price_from)}
                  </div>
                  {(item.tags || "")
                    .split(",")
                    .filter((t) => t.trim())
                    .map((tag, i) => {
                      const [name, price] = tag.trim().split(":");
                      return price ? (
                        <div key={i} className="mt-1">
                          <span className="font-medium">{name}:</span> ₦
                          {parseInt(price).toLocaleString()}
                        </div>
                      ) : null;
                    })}
                </div>

                {/* Contact Section */}
                <div>
                  <h3 className="font-semibold mb-3">Contact</h3>
                  {!showContact ? (
                    <button
                      onClick={handleShowContact}
                      className="flex items-center gap-2 bg-[rgb(0,6,90)] text-white px-4 py-2 rounded-lg hover:bg-[#0e1f45] transition"
                    >
                      <FontAwesomeIcon icon={faComment} />
                      Show Contact Details
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {item.whatsapp && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faWhatsapp}
                              className="text-green-600"
                            />
                            <span>{formatWhatsapp(item.whatsapp)}</span>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(formatWhatsapp(item.whatsapp))
                            }
                            className={`text-xs px-2 py-1 rounded ${
                              copied
                                ? "bg-green-600 text-white"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {copied ? "✓ Copied" : "📋 Copy"}
                          </button>
                        </div>
                      )}

                      {item.phone && item.phone !== item.whatsapp && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="text-blue-600"
                            />
                            <span>{formatWhatsapp(item.phone)}</span>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(formatWhatsapp(item.phone))
                            }
                            className={`text-xs px-2 py-1 rounded ${
                              copied
                                ? "bg-blue-600 text-white"
                                : "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {copied ? "✓ Copied" : "📋 Copy"}
                          </button>
                        </div>
                      )}

                      {item.address && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="text-gray-600 mt-0.5"
                            />
                            <span className="text-gray-700">
                              {item.address}
                            </span>
                          </div>
                        </div>
                      )}

                      {item.lat && item.lon && (
                        <a
                          href={`https://maps.google.com/?q=${item.lat},${item.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          🗺️ Open in Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3">
                  <a
                    href={`https://wa.me/${formatWhatsapp(
                      item.whatsapp
                    ).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                    Chat on WhatsApp
                  </a>
                  <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthToast={() => {}}
      />
    </>
  );
};

export default BusinessDetailModal;
