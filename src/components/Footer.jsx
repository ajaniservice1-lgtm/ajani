import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/Logos/logo6.png";

const Footer = () => {
  const year = new Date().getFullYear();

  // Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  return (
    <motion.footer
      className="border-t border-slate-700 text-slate-200 text-sm py-10 font-rubik bg-[rgb(0,6,90)]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={staggerContainer} // Apply stagger on the parent
    >
      <div className="max-w-7xl mx-auto px-5">
        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          variants={staggerContainer}
        >
          {/* Left: Logo, Tagline & Summary */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <img src={Logo} alt="Ajani Logo" className="h-8 w-auto" />
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
              <a
                href="https://www.tiktok.com/@ajanismartguide?lang=en-GB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-blue-400 transition-colors"
                aria-label="Follow us on TikTok"
              >
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </motion.div>

          {/* Center: Spacer */}
          <motion.div variants={fadeUp}></motion.div>

          {/* Right: Links */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between"
          >
            <div className="flex flex-col gap-3">
              <Link to="/privacypage">Privacy Policy</Link>
              <Link to="/termspage">Terms</Link>
              <Link to="/contact" className="hover:text-blue-400 transition">
                Contact
              </Link>
              <Link to="/blogpage" className="hover:text-blue-400 transition">
                blogpage
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Copyright Line */}
        <motion.div
          variants={fadeUp}
          className="pt-6 border-t border-slate-700 text-center md:text-left"
        >
          <p>
            © {year} <span className="font-medium text-blue-400">Ajani</span> •
            Ibadan Price Insights. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
