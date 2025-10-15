import React, { useState, useEffect } from "react";
import { useDirectoryData } from "../hook/useDirectoryData";

// ✅ Hardcoded fallback images
const FALLBACK_IMAGES = {
  "food-default":
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "hotel-default":
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "event-default":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default: "https://via.placeholder.com/300x200?text=No+Image",
};

const getCardImage = (item) => {
  const sheetImage = (item.image_url || "").trim();
  if (sheetImage && sheetImage.startsWith("http")) return sheetImage;

  if (item.category?.includes("food")) return FALLBACK_IMAGES["food-default"];
  if (item.category?.includes("hotel")) return FALLBACK_IMAGES["hotel-default"];
  if (item.category?.includes("event")) return FALLBACK_IMAGES["event-default"];
  return FALLBACK_IMAGES["default"];
};

const getIconImage = (item) => {
  if (item.category?.includes("food"))
    return "https://via.placeholder.com/40?text=U";
  if (item.category?.includes("hotel"))
    return "https://via.placeholder.com/40?text=B";
  if (item.category?.includes("event"))
    return "https://via.placeholder.com/40?text=C";
  return "https://via.placeholder.com/40?text=⭐";
};

const formatTags = (tagString) => {
  if (!tagString) return [];
  return tagString.split(",").map((tag) => {
    const [name, price] = tag.trim().split(":");
    if (price) {
      const num = parseInt(price);
      return `${name}: ₦${num.toLocaleString()}`;
    }
    return name;
  });
};

const AiTopPicks = () => {
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";

  const { listings, loading, error } = useDirectoryData(SHEET_ID, API_KEY);

  // ✅ Filter only featured items
  const topPicks = listings
    .filter((item) => item.is_featured?.toLowerCase() === "yes")
    .slice(0, 3); // Only show 3

  // ✅ Delay content by 4 seconds
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !showContent) {
    return (
      <section className="bg-slate-100 py-16 font-rubik">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Top picks data is loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-slate-100 py-16 font-rubik">
        <div className="max-w-7xl mx-auto px-5 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  if (topPicks.length === 0) {
    return null; // Or show a fallback message
  }

  return (
    <section id="toppicks" className="bg-slate-100 py-16 font-rubik">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Ajani's Top Picks for You</h2>
          <p className="text-slate-600">
            Verified recommendations based on popular queries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topPicks.map((card, i) => (
            <div
              key={card.id || i}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow hover:shadow-md hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={getIconImage(card)}
                  alt={`${card.name} icon`}
                  className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40?text=⚡";
                  }}
                />
                <h3 className="font-bold text-lg">{card.name}</h3>
              </div>

              <img
                src={getCardImage(card)}
                alt={card.name}
                className="w-full h-40 object-cover rounded mb-3"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />

              <p className="mb-4 text-slate-700">{card.short_desc}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {formatTags(card.tags).map((tag, j) => (
                  <span
                    key={j}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                <i className="fas fa-check-circle text-green-500"></i>
                Verified today by Ajani's team
              </div>

              <div className="flex gap-3">
                <a
                  href={`https://wa.me/${(card.whatsapp || "").replace(
                    /\D/g,
                    ""
                  )}?text=Hi%20Ajani%20👋`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-lg transition shadow hover:shadow-md hover:-translate-y-0.5"
                >
                  <i className="fab fa-whatsapp"></i> Ask Ajani
                </a>
                <a
                  href="#vendors"
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b] rounded-xl font-medium text-sm transition"
                >
                  <i className="fas fa-list text-xs"></i>
                  See More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AiTopPicks;
