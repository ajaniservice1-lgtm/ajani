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

  return (
    <>
      {/* Fixed Header - Light Background */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-300 font-rubik shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3">
          <nav className="flex items-center justify-between mt-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  closeMenu();
                  navigate("/"); // Go to home route
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth", // ✅ Smooth scroll from current position → top
                    });
                  }, 150);
                }}
                className="flex items-center gap-3 focus:outline-none"
                aria-label="Go to homepage"
              >
                <div className="">
                  <img src={Logo} alt="Ajani Logo" className="h-8 w-24" />
                  <div className="md:text-sm text-[12.5px] text-slate-600 duration-300 hover:text-gray-900">
                    The Ibadan Smart Guide
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-6 text-gray-900 font-medium">
              {[
                { label: "Price Insights", id: "priceinsight" },
                { label: "Top Picks", id: "toppicks" },
                { label: "Directory", id: "directory" },
                { label: "For Businesses", id: "vendors" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    if (element) {
                      window.scrollTo({
                        top: element.offsetTop - 80,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="hover:text-gray-400 duration-300"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop WhatsApp Button */}
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
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

      {/* Full-Width Mobile Menu (Light Theme) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-20"
            onClick={closeMenu}
          ></div>

          <div
            className={`fixed left-0 top-0 w-full h-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with logo and close button */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <a href="#" onClick={closeMenu}>
                <img src={Logo} alt="Ajani Logo" className="h-8 w-24" />
                <div className="md:text-sm text-[12.5px] text-slate-600 hover:text-gray-900 duration-300 font-rubik mb-[-2px]">
                  Ajani The Ibadan Guide
                </div>
              </a>
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
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block py-2 text-gray-900 duration-300 hover:text-green-600 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    if (element) {
                      window.scrollTo({
                        top: element.offsetTop - 80,
                        behavior: "smooth",
                      });
                    }
                    closeMenu();
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* WhatsApp Button at Bottom */}
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
      )}

      {/* Spacer for fixed header */}
      <div className="h-20 md:h-16"></div>
    </>
  );
};

export default Header;
