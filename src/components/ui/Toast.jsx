// src/components/ui/Toast.jsx
import { useEffect, useState } from "react";

export default function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000); // Auto-hide after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeInSlideUp">
        <span>👋</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
