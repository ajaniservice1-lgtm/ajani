// src/components/Hero.jsx
import React, { useEffect } from "react";
import Logos from "../assets/Logos/images.jpg";

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section
      id="hero"
      className="bg-[#f8f9fa] py-16 md:py-20 lg:py-14 font-rubik"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Text Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            {/* Headline with animated "Hi," */}
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-[#101828] leading-tight">
             Hi, I'm Ajani  Your Ibadan Guide 
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-[17px] leading-relaxed text-slate-600 mb-6">
              Ask me anything: Where's the cheapest amala in Bodija? Best hotels
              under ₦10,000? Weekend events happening now?
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center md:mx-auto justify-center gap-2 mx-8 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium text-lg transition"
              >
                <i className="fab fa-whatsapp mr-2"></i> Chat on WhatsApp
              </a>

              {/* Browse Directory Button */}
              <a
                href="#directory"
                className="inline-flex items-center justify-center gap-2 bg-[#1ab9d6] hover:bg-[#086676] hover:text-slate-200 text-slate-900 px-6 py-3 rounded-lg font-medium mx-8 text-lg transition"
              >
                <i className="fas fa-search mr-2"></i> Browse Directory
              </a>
            </div>
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
