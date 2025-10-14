import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FeaturedBanner = () => {
  const [showModal, setShowModal] = useState(null);

  const ads = [
    {
      id: "sponsored",
      title: "Sponsored",
      subtitle: "Promote your business on Ajani",
      description:
        "Get featured in area searches — reach local buyers actively looking for your services.",
      button: "Learn More",
      bgColor: "bg-blue-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      image:
        "https://media.istockphoto.com/id/2207324198/photo/buffet-style-serving-in-chafing-dish.jpg?s=1024x1024&w=is&k=20&c=ORtP-Vc-AmtBXMme8v3pjULWpZ8FcAugXuPbOFtO_Tc=",
      adContent: (
        <div className="text-center font-rubik">
          <img
            src="https://media.istockphoto.com/id/2207324198/photo/buffet-style-serving-in-chafing-dish.jpg?s=1024x1024&w=is&k=20&c=ORtP-Vc-AmtBXMme8v3pjULWpZ8FcAugXuPbOFtO_Tc="
            alt="Amala Skye"
            className="mx-auto mb-4 rounded-lg shadow-md max-h-48 object-contain"
          />
          <h3 className="text-xl font-bold text-gray-800">
            🔥 Amala Skye — Ibadan’s #1 Amala Spot!
          </h3>
          <p className="mt-2 text-gray-600">
            Authentic amala with assorted meats, fresh efo, and hot pepper
            sauce. Open 7AM–9PM daily.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-green-100 px-2 py-1 rounded-full">₦1,200</span>
            <span className="bg-yellow-100 px-2 py-1 rounded-full">⭐ 4.8</span>
            <span className="bg-red-100 px-2 py-1 rounded-full">Bodija</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            *Limited slots available — get featured before the weekend rush!
          </p>
          <div className="mt-6">
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋%20I%20want%20to%20advertise%20my%20business!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow"
            >
              <i className="fab fa-whatsapp"></i> WhatsApp Us to Advertise
            </a>
          </div>
        </div>
      ),
    },
    {
      id: "weekend-special",
      title: "Weekend Special",
      subtitle: "Taste of Ibadan Food Festival",
      description:
        "Experience the best of Ibadan cuisine this weekend at Agodi Gardens. 20+ vendors.",
      button: "Get Details",
      bgColor: "bg-green-50",
      buttonColor: "bg-green-600 hover:bg-green-700",
      image:
        "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      adContent: (
        <div className="text-center font-rubik">
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
            alt="Food Festival"
            className="mx-auto mb-4 rounded-lg shadow-md max-h-48 object-contain"
          />
          <h3 className="text-xl font-bold text-gray-800">
            🎉 Taste of Ibadan — This Weekend Only!
          </h3>
          <p className="mt-2 text-gray-600">
            20+ vendors, live music, kids zone, and free parking. Don’t miss
            out!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-blue-100 px-2 py-1 rounded-full">
              ₦1,000 Entry
            </span>
            <span className="bg-purple-100 px-2 py-1 rounded-full">
              Agodi Gardens
            </span>
            <span className="bg-orange-100 px-2 py-1 rounded-full">
              Sat & Sun
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            *Bring your family — early birds get free jollof rice!
          </p>
          <div className="mt-6">
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋%20I%20want%20to%20be%20a%20vendor%20at%20the%20Festival!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow"
            >
              <i className="fab fa-whatsapp"></i> WhatsApp Us to Join
            </a>
          </div>
        </div>
      ),
    },
    {
      id: "featured-vendor",
      title: "Featured Vendor",
      subtitle: "Dugbe Market Delicacies",
      description:
        "Fresh produce, spices, and local delicacies. Open daily from 8AM to 6PM.",
      button: "Contact",
      bgColor: "bg-yellow-50",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
      image:
        "https://images.unsplash.com/photo-1694825588875-190db201a997?q=80&w=1630&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      adContent: (
        <div className="text-center font-rubik">
          <img
            src="https://images.unsplash.com/photo-1694825588875-190db201a997?q=80&w=1630&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Dugbe Market"
            className="mx-auto mb-4 rounded-lg shadow-md max-h-48 object-contain"
          />
          <h3 className="text-xl font-bold text-gray-800">
            🌶️ Dugbe Market — Fresh Spices & Local Delicacies!
          </h3>
          <p className="mt-2 text-gray-600">
            Get the freshest ingredients for your kitchen — yam, pepper, ogbono,
            and more. Bargain like a pro!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-red-100 px-2 py-1 rounded-full">₦500/kg</span>
            <span className="bg-indigo-100 px-2 py-1 rounded-full">Dugbe</span>
            <span className="bg-teal-100 px-2 py-1 rounded-full">
              Open 8AM–6PM
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            *Ask for Mama Nkechi — she gives the best deals!
          </p>
          <div className="mt-6">
            <a
              href="https://wa.me/2348123456789?text=Hi%20Ajani%20👋%20I%20want%20to%20list%20my%20stall%20in%20Dugbe%20Market!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow"
            >
              <i className="fab fa-whatsapp"></i> WhatsApp Us to List
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-900 text-white font-rubik">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold mb-2">Featured Businesses</h2>
          <p className="text-gray-300">
            Discover these sponsored listings from local businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className={`relative rounded-lg shadow-lg p-6 cursor-pointer transition-transform hover:-translate-y-1 ${ad.bgColor}`}
              onClick={() => setShowModal(ad.id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowModal(ad.id);
              }}
              aria-label={`View details for ${ad.subtitle}`}
            >
              <div className="text-xs font-medium text-gray-500 mb-2">
                {ad.title}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {ad.subtitle}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{ad.description}</p>
              <button
                className={`px-4 py-2 rounded-lg font-semibold text-white transition ${ad.buttonColor}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(ad.id);
                }}
                aria-label={`Learn more about ${ad.subtitle}`}
              >
                {ad.button}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal with Framer Motion */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 text-center ${
                ads.find((a) => a.id === showModal)?.bgColor || "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`modal-title-${showModal}`}
            >
              <button
                onClick={() => setShowModal(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>

              {ads.find((a) => a.id === showModal)?.adContent}

              <div className="mt-6">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedBanner;
