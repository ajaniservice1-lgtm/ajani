// src/components/Hero.jsx
import React, { useEffect } from "react";
import Logos from "../assets/Logos/images.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section
      id="hero"
      className="bg-[#f8f9fa] py-10 md:py-20 lg:py-16 font-rubik"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Text Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-semibold mb-4 text-[#101828] leading-tight">
              Find the best of lbadan prices, places & trusted vendors.
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-[17px] leading-relaxed text-slate-600 mb-6">
              Real time price insights, a verified vendor directory, and an easy
              way for businesses to get discovered
            </p>

            {/* Buttons */}
            <>
              {" "}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 mx-8 md:mx-auto bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium text-lg transition"
                >
                  <i className="fab fa-whatsapp mr-2"></i> Chat on WhatsApp
                </a>
                {/* Browse Directory Button */}
                <button
                  onClick={() => {
                    // Optional: Add scroll-to-directory logic later
                    const el = document.getElementById("directory");
                    if (el) {
                      window.scrollTo({
                        top: el.offsetTop - 80,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-slate-200  mx-8 hover:bg-slate-300 hover:text-slate-900 text-slate-900 px-6 py-3 rounded-lg font-medium text-lg transition"
                >
                  <i className="fas fa-search mr-2"></i> Browse Directory
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* WhatsApp Button */}
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
                  className="inline-flex items-center justify-center gap-2 bg-[#15a3bc]  mx-8 lg:mx-auto hover:bg-[#086676] text-white px-6 py-3 rounded-lg font-medium text-lg transition"
                >
                  <FontAwesomeIcon icon={faChartLine} />
                  See Price Insights
                </button>
                {/* Browse Directory Button */}
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
                  className="inline-flex items-center justify-center gap-2 bg-slate-200  mx-8 hover:bg-slate-300 hover:text-slate-900 text-slate-900 px-6 py-3 rounded-lg font-medium text-lg transition"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  List Your Business
                </button>
              </div>
              <p className="text-[13px]">
                Trusted by 2,000+ locals . 300+ vendors onboarded
              </p>
            </>
          </div>
          {/* Right Side: Image */}
          <div className="hidden lg:block">
            <img
              src={Logos}
              alt="Ajani - Your Ibadan Guide"
              className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
