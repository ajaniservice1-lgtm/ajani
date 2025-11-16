import { useState, useEffect } from "react";
import { useAuth } from "../hook/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faLock,
  faEnvelope,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

export default function ContactReveal({
  value,
  formattedValue,
  onAuthOpen,
  Contact = "Contact",
}) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Reset hover on mobile after delay
  useEffect(() => {
    let timer;
    if (isHovered) {
      timer = setTimeout(() => setIsHovered(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);

  const handleCopy = () => {
    if (!user || !formattedValue) return;
    navigator.clipboard.writeText(formattedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Choose icon based on label
  const getIcon = () => {
    switch (Contact) {
      case "email":
        return faEnvelope;
      default:
        return faUserShield;
    }
  };

  const Icon = getIcon();

  // Logged in → show number/email
  if (user && formattedValue) {
    return (
      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-sm">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Contact
          </p>
          <p className="font-semibold text-gray-900 truncate">
            {formattedValue}
          </p>
        </div>

        {/* Copy Button + Tooltip */}
        <button
          onClick={handleCopy}
          className="relative flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          aria-label="Copy to clipboard"
        >
          <FontAwesomeIcon icon={faCopy} className="text-sm" />

          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap animate-fade">
              Copied!
            </span>
          )}
        </button>
      </div>
    );
  }

  // Locked / Not logged in (blur + CTA)
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAuthOpen}
      className={`
        relative p-2 rounded-lg border-2 cursor-pointer transition-all duration-300
        ${
          isHovered
            ? "border-blue-400 bg-blue-50 shadow-md"
            : "border-dashed border-gray-300 bg-gray-50"
        }
        min-w-[140px]
      `}
    >
      <div className="relative flex items-center gap-2">
        {/* Blurred Placeholder */}
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Contact
          </p>
          <div className="bg-gray-200 animate-pulse w-20 h-4 rounded mt-1"></div>
        </div>

        {/* Lock Badge */}
        <div className="flex items-center justify-center w-7 h-7 bg-[rgb(0,6,90)] text-white rounded-lg transition-transform">
          <FontAwesomeIcon icon={faLock} className="text-xs" />
        </div>
      </div>

      {/* Overlay CTA */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg
          transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }
        `}
      >
        <div className="text-center p-1 max-w-[85%]">
          <FontAwesomeIcon
            icon={faLock}
            className="text-[10px] w-6 h-6 text-white bg-[rgb(0,6,90)] rounded-full mb-1 inline-flex items-center justify-center"
          />
          <p className="text-xs font-semibold text-gray-800 mb-0.5">
            Unlock Contact
          </p>
          <p className="text-[10px] text-gray-600 mb-1">
            Log in to view and copy Contact securely.
          </p>
          <p className="text-blue-600 text-[10px] font-medium inline-flex items-center">
            Continue{" "}
            <FontAwesomeIcon icon={faLock} className="ml-1 text-[10px]" />
          </p>
        </div>
      </div>
    </div>
  );
}
