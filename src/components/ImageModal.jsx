// src/components/ImageModal.jsx
import React, { useState, useEffect } from "react";

const ImageModal = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => setCurrentIndex(initialIndex), [initialIndex]);

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl bg-black/50 rounded-full p-2 hover:bg-black/70"
        aria-label="Close"
      >
        &times;
      </button>

      <button
        onClick={handlePrev}
        className="absolute left-4 text-white text-4xl bg-black/50 rounded-full p-3 hover:bg-black/70"
        aria-label="Previous"
      >
        &#10094;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 text-white text-4xl bg-black/50 rounded-full p-3 hover:bg-black/70"
        aria-label="Next"
      >
        &#10095;
      </button>

      <div className="max-w-full max-h-full flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="max-w-full max-h-full object-scale-down"
        />
      </div>

      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageModal;
