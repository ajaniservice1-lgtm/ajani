// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logos/logo5.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Fixed Header - Light Blue Background */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#e6f2ff] font-rubik">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* Nav Container - White rounded with shadow */}
          <nav className="flex items-center justify-between bg-[#f2f9ff] rounded-full shadow-md px-6 py-3">
            {/* Left: Logo + Tagline */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  closeMenu();
                  navigate("/");
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 150);
                }}
                className="flex items-center gap-2 focus:outline-none"
                aria-label="Go to homepage"
              >
                <div className="flex items-center gap-2">
                  <img src={Logo} alt="Ajani Logo" className="h-8 w-24" />
                  {/* Vertical Divider */}
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <span className="md:text-sm text-[12.5px] text-slate-600 duration-300 hover:text-gray-900">
                    The Ibadan Smart Guide
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-gray-900 font-medium">
              {[
                { label: "Price Insights", id: "priceinsight" },
                { label: "Top Picks", id: "toppicks" },
                { label: "Directory", id: "directory" },
                { label: "For Businesses", id: "vendors" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-gray-500 duration-300 text-sm"
                  aria-label={`Go to ${item.label}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right: WhatsApp Button */}
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full font-semibold text-sm transition"
            >
              <i className="fab fa-whatsapp"></i> Chat with Ajani
            </a>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-gray-900 focus:outline-none"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className="fixed inset-0 z-50 pointer-events-none md:hidden">
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        ></div>

        {/* Sliding Panel */}
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#f2f9ff] flex flex-col transform transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <button
              onClick={closeMenu}
              className="flex flex-col items-start focus:outline-none"
              aria-label="Close menu"
            >
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Ajani Logo" className="h-8 w-24" />
                {/* Vertical Divider */}
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <span className="md:text-sm text-[12.5px] text-slate-600 duration-300 hover:text-gray-900">
                  The Ibadan Smart Guide
                </span>
              </div>
            </button>
            <button
              onClick={closeMenu}
              className="text-gray-900 hover:text-gray-600"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-5 space-y-4 font-rubik">
            {[
              { label: "Price Insights", id: "priceinsight" },
              { label: "Top Picks", id: "toppicks" },
              { label: "Directory", id: "directory" },
              { label: "For Businesses", id: "vendors" },
              { label: "FAQ", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                className="block w-full text-left py-2 text-gray-900 duration-300 hover:text-green-600 font-medium focus:outline-none"
                onClick={() => {
                  closeMenu();
                  setTimeout(() => scrollToSection(item.id), 100);
                }}
                aria-label={`Go to ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* WhatsApp Button */}
          <div className="p-5 border-t border-gray-200">
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold w-full transition"
              onClick={closeMenu}
            >
              <i className="fab fa-whatsapp"></i> Chat with Ajani
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-16"></div>
    </>
  );
};

export default Header;
