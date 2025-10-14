import React from "react";
import { useEffect } from "react";
import Logo from "../assets/Logos/logo8.png";

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <section id="hero" className="bg-[#eef8fd] lg:h-lvh md:h-lvh h-[800px]">
        <div
          // ✅ Fixed: removed trailing space
          className="max-w-4xl mx-auto px-5 py-20  text-center font-rubik "
        >
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-12">
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={Logo}
                alt="Ajani - Your Ibadan Guide"
                className="w-full h-full object-contain"
              />
            </a>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-[#101828]">
            Hi, I'm Ajani — Your Ibadan Guide
          </h1>

          <p className=":lg:text-lg text-[15px] md:text-xl leading-[1.5] text-slate-600 mb-10">
            Ask me anything: Where's the cheapest amala in Bodija? Best hotels
            under ₦10,000? Weekend events happening now?
          </p>

          <div className="flex flex-col sm:flex-row md:gap-4 justify-center gap-8">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋" // ✅ Fixed: removed extra spaces
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 duration-300 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg transition shadow hover:shadow-md hover:-translate-y-0.5"
            >
              <i className="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>

            {/* Browse Directory Button */}
            <a
              href="#directory" // ✅ Changed to #directory (matches your nav)
              className="flex items-center justify-center gap-2 bg-[#1ab9d6] duration-300 hover:bg-[#086676] hover:text-slate-200 text-slate-900 px-6 py-4 rounded-lg font-semibold text-lg transition shadow hover:shadow-md hover:-translate-y-0.5"
            >
              <i className="fas fa-search"></i> Browse Directory
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
