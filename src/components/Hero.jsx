// src/components/Hero.jsx
import React, { useEffect } from "react";
import CountUp from "react-countup";
import PriceInsights from "./PriceInsights";
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
      className="bg-[#eef8fd] py-10 md:py-20 lg:py-16 font-rubik "
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Text Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-4xl lg:text-5xl md:font-semibold font-extrabold mb-4 text-[#101828] leading-tight">
              Find the best of lbadan prices, places & trusted vendors.
            </h1>

            {/* Subtitle */}
            <p className="text-sm font-medium md:font-normal md:text-lg lg:text-[16px] leading-relaxed text-slate-600 mb-6">
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
                  className="hidden md:inline-flex items-center justify-center gap-2 bg-[rgb(0,6,90)] duration-300 mx-8 hover:bg-[rgb(15,19,71)] hover:text-white text-white px-6 py-3 rounded-lg font-medium text-lg transition"
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
                  className="inline-flex items-center justify-center gap-2 bg-[rgb(0,6,90)] duration-300  mx-8 lg:mx-auto hover:bg-[rgb(15,19,71)] text-white px-6 py-3 rounded-lg font-medium text-lg transition"
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
                  className="hidden md:flex items-center justify-center gap-2 bg-[rgb(0,6,90)] duration-300 mx-8 hover:bg-[rgb(15,19,71)] hover:text-slate-100 text-white px-6 py-3 rounded-lg font-medium text-lg transition"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  List Your Business
                </button>
              </div>
              <span className="text-[13px] flex gap-1 font-medium md:font-normal text-slate-600">
                Trusted by <CountUp end={2000} duration={2} separator="," />+
                locals • <CountUp end={300} duration={2} />+ vendors onboarded
              </span>
            </>
          </div>
          {/* Right Side: Image */}
          <PriceInsights />
        </div>
      </div>
    </section>
  );
};

export default Hero;
