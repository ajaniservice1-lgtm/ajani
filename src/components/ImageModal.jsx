// src/components/ImageModal.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faComment, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hook/useAuth";
import AuthModal from "./ui/AuthModal";

const ImageModal = ({
  images,
  initialIndex,
  onClose,
  item, // Full listing object (for WhatsApp, name, etc.)
  onAuthToast,
  onOpenChat, // ✅ Critical: function to open global ChatWidget
}) => {
  const { user, loading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showContactScreen, setShowContactScreen] = useState(false);
  const [showContactNumber, setShowContactNumber] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setShowContactScreen(false);
    setShowContactNumber(false);
  }, [initialIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowContactScreen(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowContactScreen(false);
    } else {
      setShowContactScreen(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, currentIndex, images.length]);

  // Handle "Show Contact" button
  const handleShowContactFromModal = () => {
    if (authLoading) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setShowContactNumber(true);
    setTimeout(() => setShowContactNumber(false), 20000);
  };

  // WhatsApp formatter (same as Directory)
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

  // Render content: image or contact screen
  const renderContent = () => {
    if (showContactScreen) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative z-10 text-center max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-2">Like what you saw?</h3>
            <p className="mb-4">Contact the seller now to negotiate!</p>

            <div className="space-y-2">
              {showContactNumber ? (
                <div className="flex flex-col items-center justify-center bg-green-100 text-slate-800 p-3 rounded-lg font-medium">
                  <span className="mb-2">
                    📞 {formatWhatsapp(item?.whatsapp) || "N/A"}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        formatWhatsapp(item?.whatsapp) || ""
                      );
                      alert("Number copied to clipboard!");
                    }}
                    className="px-3 py-1 bg-green-700 text-white rounded text-sm flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faCopy} /> Copy
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleShowContactFromModal}
                  disabled={authLoading}
                  className="w-full bg-[rgb(0,6,90)] hover:bg-[#0e265c] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPhone} /> Show contact
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  onClose(); // Close modal
                  onOpenChat?.(); // ✅ Open global ChatWidget
                }}
                className="w-full border border-blue-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faComment} /> Chat with Ajani
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Regular image view
    return (
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
      />
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl bg-black/50 rounded-full p-2 hover:bg-black/70 z-10"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className={`absolute left-4 text-white text-4xl bg-black/50 rounded-full p-3 hover:bg-black/70 z-10 ${
            currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Previous Image"
          disabled={currentIndex === 0}
        >
          &#10094;
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 text-white text-4xl bg-black/50 rounded-full p-3 hover:bg-black/70 z-10"
          aria-label="Next Image"
        >
          &#10095;
        </button>

        {/* Main Content */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          {renderContent()}
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
          <span>
            {showContactScreen
              ? `${images.length}/${images.length}`
              : `${currentIndex + 1}/${images.length}`}
          </span>
        </div>
      </div>

      {/* Auth Modal (for unauthenticated users) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthToast={onAuthToast}
        />
      )}
    </>
  );
};

export default ImageModal;
