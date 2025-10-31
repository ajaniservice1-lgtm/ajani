// src/components/Hero.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import PriceInsights from "./PriceInsights";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChartLine } from "@fortawesome/free-solid-svg-icons";

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Refs for CountUp re-animation
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Reset animation state when out of view
  useEffect(() => {
    if (isInView) {
      setHasAnimated(true);
    } else {
      setHasAnimated(false);
    }
  }, [isInView]);

  return (
    <section
      id="hero"
      className="bg-[#eef8fd] py-8 md:py-20 lg:py-16 font-rubik overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div ref={heroRef} className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px", once: false }}
            className="flex flex-col justify-center space-y-6 text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-4xl lg:text-5xl md:font-semibold font-bold mb-4 text-[#101828] leading-tight">
              Find the best of Ibadan prices, places & trusted vendors.
            </h1>

            <p className="text-sm font-medium md:font-normal md:text-lg lg:text-[16px] leading-relaxed text-slate-600 mb-6">
              Real time price insights, a verified vendor directory, and an easy
              way for businesses to get discovered
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 mx-8 px-6 py-3 md:mx-auto bg-green-500 hover:bg-green-600 text-white  rounded-lg font-medium text-lg transition"
              >
                <i className="fab fa-whatsapp mr-2"></i> Chat on WhatsApp
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById("directory");
                  if (el) {
                    window.scrollTo({
                      top: el.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
                className="hidden md:inline-flex items-center justify-center gap-2 mx-8 px-6 py-3 md:mx-auto bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white rounded-lg font-medium text-lg transition"
              >
                <i className="fas fa-search mr-2"></i> Browse Directory
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => {
                  const el = document.getElementById("priceinsight");
                  if (el) {
                    window.scrollTo({
                      top: el.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 mx-8 px-6 py-3 md:mx-auto bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white  rounded-lg font-medium text-lg transition"
              >
                <FontAwesomeIcon icon={faChartLine} />
                See Price Insights
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("vendors");
                  if (el) {
                    window.scrollTo({
                      top: el.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
                className="md:flex items-center justify-center gap-2 mx-8 px-6 py-3 md:mx-auto bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white rounded-lg font-medium text-lg transition"
              >
                <FontAwesomeIcon icon={faCheck} />
                List Your Business
              </button>
            </div>

            {/* ✅ Re-animating CountUp */}
            <span className="text-[13px] flex gap-1 font-medium text-slate-600 justify-center md:justify-start">
              Trusted by{" "}
              {hasAnimated && <CountUp end={2000} duration={2} separator="," />}
              + locals • {hasAnimated && <CountUp end={300} duration={2} />}+
              vendors onboarded
            </span>
          </motion.div>

          {/* Right Side Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px", once: false }}
          >
            <PriceInsights />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
