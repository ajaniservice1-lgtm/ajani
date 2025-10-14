import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logos/logo6.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700 text-slate-400 text-sm py-10 font-rubik bg-[#101828]">
      <div className="max-w-7xl mx-auto px-5">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left: Logo, Tagline & Summary */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={Logo} alt="Ajani Logo" className="h-8 w-auto" />
              <span className="text-slate-300 text-sm md:text-base">
                • Ibadan Price Insights
              </span>
            </div>

            <p className="mb-4 leading-relaxed max-w-md">
              Ajani is your smart digital assistant for discovering local
              services, prices, and businesses across Ibadan. We help you make
              informed decisions — whether you’re buying, selling, or just
              exploring.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4 text-lg">
              <a
                href="https://www.facebook.com/profile.php?id=61580295532814"
                className="text-slate-500 hover:text-blue-400 transition"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>

              <a
                href="#"
                className="text-slate-500 hover:text-blue-400 transition"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>

              <a
                href="mailto:ajaniservice1@gmail.com"
                className="text-slate-500 hover:text-blue-400 transition"
                aria-label="Email"
              >
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Center: Spacer */}
          <div></div>

          {/* Right: Links + WhatsApp */}
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <Link to="/privacypage">Privacy Policy</Link>
              <Link to="/termspage">Terms</Link>
              <Link to="/contact" className="hover:text-blue-400 transition">
                Contact
              </Link>
            </div>

            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <i className="fab fa-whatsapp"></i> Chat with Ajani
            </a>
          </div>
        </div>

        {/* Bottom Copyright Line */}
        <div className="pt-6 border-t border-slate-700 text-center md:text-left">
          <p>
            © {year} <span className="font-medium text-blue-400">Ajani</span> •
            Ibadan Price Insights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
