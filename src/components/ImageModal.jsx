// src/components/ImageModal.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faComment } from "@fortawesome/free-solid-svg-icons";

const ImageModal = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showContactScreen, setShowContactScreen] = useState(false); // New state for contact screen

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setShowContactScreen(false); // Reset contact screen on new modal open
  }, [initialIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowContactScreen(false); // Hide contact screen if navigating back
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowContactScreen(false); // Hide contact screen if navigating forward within images
    } else {
      // Last image reached, show contact screen
      setShowContactScreen(true);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, currentIndex, images.length]);

  // Render the main image or the contact screen
  const renderContent = () => {
    if (showContactScreen) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
          {/* Overlay with semi-transparent background */}
          <div className="absolute inset-0 bg-black/70"></div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-2">Like what you saw?</h3>
            <p className="mb-4">Contact the seller now to negotiate!</p>

            {/* Contact Buttons */}
            <div className="space-y-2">
              <button
                onClick={onClose} // You can also add logic to show contact details here
                className="w-full bg-[rgb(0,6,90)] hover:bg-[#0e265c] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPhone} /> Show contact
              </button>
              <button
                onClick={onClose} // You can also add logic to start chat here
                className="w-full border border-blue-500 text-gray-200 hover:text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faComment} /> Start chat
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render the current image
    return (
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
      />
    );
  };

  return (
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

      {/* Image or Contact Screen Container */}
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
  );
};

export default ImageModal;
