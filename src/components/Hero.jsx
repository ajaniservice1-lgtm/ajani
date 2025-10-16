// src/components/Hero.jsx
import React, { useEffect } from "react";
import Logo from "../assets/Logos/logo8.png";
import Logos from "../assets/Logos/images.jpg";

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section
      id="hero"
      className="bg-[#f8f9fa] lg:h-screen md:h-screen h-auto py-12 lg:pt-0 flex items-center mt-[-40px]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 w-full">
        {/* Grid Layout: Text Left, Image Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {" "}
          {/* ✅ Increased gap */}
          {/* Left Side: Text Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-[#101828] leading-tight">
              Hi, I'm Ajani — Your Ibadan Guide
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
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium text-lg transition"
              >
                <i className="fab fa-whatsapp mr-2"></i> Chat on WhatsApp
              </a>

              {/* Browse Directory Button */}
              <a
                href="#directory"
                className="inline-flex items-center justify-center gap-2 bg-[#1ab9d6] hover:bg-[#086676] hover:text-slate-200 text-slate-900 px-6 py-3 rounded-lg font-medium text-lg transition"
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
      {/* Centered Bottom Bounce Animation: "Click here to learn more" */}
      <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2">
        <a
          href="#priceinsight"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById("priceinsight");
            if (element) {
              window.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth",
              });
            }
          }}
          className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-gray-800 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 animate-bounce"
        >
          <i className="fas fa-arrow-down text-xs"></i> Click here to learn more
        </a>
      </div>
    </section>
  );
};

export default Hero;

// src/components/Hero.jsx
// import React, { useEffect } from "react";
// import Logo from "../assets/Logos/logo8.png";
// import Logos from "../assets/Logos/images.jpg";

// const Hero = () => {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   return (
//     <section
//       id="hero"
//       className="bg-[#eef8fd] lg:h-screen md:h-screen h-auto py-12 flex items-center"
//     >
//       <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 w-full">
//         {/* Grid Layout: Text Left, Image Right */}
//         <div className="grid lg:grid-cols-2 gap-8 items-center">
//           {/* Left Side: Text Content */}
//           <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
//             {/* Logo */}
//             <div className="w-24 h-24 flex items-center justify-center mx-auto lg:mx-0 mb-6">
//               <a
//                 href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="block"
//               >
//                 <img
//                   src={Logo}
//                   alt="Ajani - Your Ibadan Guide"
//                   className="w-full h-full object-contain"
//                 />
//               </a>
//             </div>

//             {/* Headline */}
//             <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-[#101828] leading-tight">
//               Hi, I'm Ajani — Your Ibadan Guide
//             </h1>

//             {/* Subtitle */}
//             <p className="text-sm md:text-lg lg:text-[17px] leading-relaxed text-slate-600 mb-6">
//               Ask me anything: Where's the cheapest amala in Bodija? Best hotels
//               under ₦10,000? Weekend events happening now?
//             </p>

//             {/* Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//               {/* WhatsApp Button */}
//               <a
//                 href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
//               >
//                 <i className="fab fa-whatsapp mr-2"></i> Chat on WhatsApp
//               </a>

//               {/* Browse Directory Button */}
//               <a
//                 href="#directory"
//                 className="flex items-center justify-center gap-2 bg-[#1ab9d6] hover:bg-[#086676] hover:text-slate-200 text-slate-900 px-6 py-4 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
//               >
//                 <i className="fas fa-search mr-2"></i> Browse Directory
//               </a>
//             </div>
//           </div>

//           {/* Right Side: Image */}
//           <div className="hidden lg:block">
//             <img
//               src={Logos}
//               alt="Ajani - Your Ibadan Guide"
//               className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg"
//             />
//           </div>
//         </div>

//         {/* Bottom-Left Bounce Animation: "Click here to learn more" */}
//         <div className="absolute bottom-6 left-6">
//           <a
//             href="#priceinsight"
//             className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 animate-bounce"
//           >
//             <i className="fas fa-arrow-down text-xs"></i> Click here to learn
//             more
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;

// import React from "react";
// import { useEffect } from "react";
// import Logo from "../assets/Logos/logo8.png";
// import Logos from "../assets/Logos/images.jpg";

// const Hero = () => {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);
//   return (
//     <>
//       <section
//         id="hero"
//         className="bg-[#eef8fd] lg:h-lvh md:h-lvh h-[800px] lg:grid lg:justify-center lg:items-center"
//       >
//         <div
//           // ✅ Fixed: removed trailing space
//           className="max-w-4xl mx-auto px-5 py-20  text-center font-rubik "
//         >
//           <div className="w-24 h-24 flex items-center justify-center mx-auto mb-12">
//             <a
//               href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <img
//                 src={Logo}
//                 alt="Ajani - Your Ibadan Guide"
//                 className="w-full h-full object-contain"
//               />
//             </a>
//           </div>

//           <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-[#101828]">
//             Hi, I'm Ajani — Your Ibadan Guide
//           </h1>

//           <p className=":lg:text-lg text-[15px] md:text-xl leading-[1.5] text-slate-600 mb-10">
//             Ask me anything: Where's the cheapest amala in Bodija? Best hotels
//             under ₦10,000? Weekend events happening now?
//           </p>
//           <div>
//             <img
//               src={Logos}
//               alt="Ajani - Your Ibadan Guide"
//               className="w-full h-full object-contain"
//             />
//           </div>
//           <div className="flex flex-col sm:flex-row md:gap-4 justify-center gap-8">
//             {/* WhatsApp Button */}
//             <a
//               href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋" // ✅ Fixed: removed extra spaces
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex items-center justify-center gap-2 bg-green-500 duration-300 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg transition shadow hover:shadow-md hover:-translate-y-0.5"
//             >
//               <i className="fab fa-whatsapp"></i> Chat on WhatsApp
//             </a>

//             {/* Browse Directory Button */}
//             <a
//               href="#directory" // ✅ Changed to #directory (matches your nav)
//               className="flex items-center justify-center gap-2 bg-[#1ab9d6] duration-300 hover:bg-[#086676] hover:text-slate-200 text-slate-900 px-6 py-4 rounded-lg font-semibold text-lg transition shadow hover:shadow-md hover:-translate-y-0.5"
//             >
//               <i className="fas fa-search"></i> Browse Directory
//             </a>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Hero;
