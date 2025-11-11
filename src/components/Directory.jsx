// src/components/Directory.jsx
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faCopy, faStar } from "@fortawesome/free-solid-svg-icons";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../hook/useAuth";
import AuthModal from "../components/ui/AuthModal";
import ImageModal from "../components/ImageModal";
import { useChat } from "../context/ChatContext";

// ---------------- Helpers ----------------
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const FALLBACK_IMAGES = {
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  transport:
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  event:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  casino:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  default: "https://via.placeholder.com/300x200?text=No+Image",
};

const getCardImages = (item) => {
  const raw = item["image url"] || "";
  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u && u.startsWith("http"));

  if (urls.length > 0) return urls;

  const cat = (item.category || "").toLowerCase();
  if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
  if (cat.includes("ridehail") || cat.includes("transport"))
    return [FALLBACK_IMAGES.transport];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  if (cat.includes("casino") || cat.includes("slot"))
    return [FALLBACK_IMAGES.casino];
  return [FALLBACK_IMAGES.default];
};

const formatWhatsapp = (number) => {
  if (!number) return "";
  const digits = number.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(
      7
    )}`;
  }
  if (digits.length === 13 && digits.startsWith("234")) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(
      9
    )}`;
  }
  return `+${digits}`;
};

// ---------------- Custom Hook ----------------
const useGoogleSheet = (sheetId, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sheetId || !apiKey) {
      setError("⚠️ Missing SHEET_ID or API_KEY");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        let result = [];
        if (
          json.values &&
          Array.isArray(json.values) &&
          json.values.length > 1
        ) {
          const headers = json.values[0];
          const rows = json.values.slice(1);
          result = rows
            .filter((row) => Array.isArray(row) && row.length > 0)
            .map((row) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
              return obj;
            });
        }
        setData(result);
      } catch (err) {
        console.error("Google Sheets fetch error:", err);
        setError("⚠️ Failed to load directory. Try again later.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, apiKey]);

  return { data: Array.isArray(data) ? data : [], loading, error };
};

// ---------------- Card Animation ----------------
const AppleCardWrapper = ({ children, index }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, delay: index * 0.08, ease: "easeOut" },
      });
    } else {
      controls.start({ opacity: 0, y: 50, scale: 0.98 });
    }
  }, [inView, controls, index]);

  return (
    <motion.div ref={ref} animate={controls} initial={{ opacity: 0, y: 50 }}>
      {children}
    </motion.div>
  );
};

// ---------------- Image Carousel ----------------
const ImageCarousel = ({ card, onImageClick }) => {
  const images = getCardImages(card);
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    timeoutRef.current = setTimeout(
      () => setIndex((prev) => (prev + 1) % images.length),
      4000
    );
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, images.length]);

  return (
    <div
      className="relative w-full h-44 md:h-52 overflow-hidden rounded-t-xl bg-gray-100 cursor-pointer"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => onImageClick(images, index)}
    >
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "tween", duration: 0.5 }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${card.name || "Business"} image ${i + 1}`}
            className="w-full h-full flex-shrink-0 object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
            loading="lazy"
          />
        ))}
      </motion.div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------- Directory Component ----------------
const Directory = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    item: null,
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [area, setArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showContact, setShowContact] = useState({});

  const directoryRef = useRef(null);
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const { openChat } = useChat();
  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  useEffect(() => {
    const update = () =>
      setItemsPerPage(
        window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 3
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleShowContact = (itemId) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setShowContact((prev) => ({ ...prev, [itemId]: true }));
    navigator.clipboard.writeText(
      formatWhatsapp(
        listings.find((i) => `business-${i.id}` === itemId)?.whatsapp
      )
    );
    setTimeout(
      () => setShowContact((prev) => ({ ...prev, [itemId]: false })),
      20000
    );
  };

  const formatPrice = (n) => (n ? Number(n).toLocaleString() : "–");

  const [filtered, setFiltered] = useState([]);
  useEffect(() => {
    if (!Array.isArray(listings)) {
      setFiltered([]);
      return;
    }

    let result = listings.filter((i) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        i.name?.toLowerCase().includes(q) ||
        i.short_desc?.toLowerCase().includes(q) ||
        i.tags?.toLowerCase().includes(q);

      const catParts = (i.category || "").split(".");
      const mainCat = capitalizeFirst(catParts[0] || i.category || "");
      const subCat = catParts[1] ? capitalizeFirst(catParts[1]) : mainCat;

      const matchesMain = mainCategory ? mainCat === mainCategory : true;
      const matchesSub = subCategory ? subCat === subCategory : true;
      const matchesArea = area ? i.area === area : true;

      return matchesSearch && matchesMain && matchesSub && matchesArea;
    });

    setFiltered(result);
    setCurrentPage(1);
  }, [listings, search, mainCategory, subCategory, area]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
    directoryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading)
    return (
      <section id="directory" className="py-16 text-center font-rubik">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading Ibadan Directory...</p>
      </section>
    );

  if (error)
    return (
      <section
        id="directory"
        className="max-w-4xl mx-auto px-4 py-12 font-rubik"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </section>
    );

  return (
    <section
      ref={directoryRef}
      id="directory"
      className="bg-[#eef8fd] py-12 font-rubik"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Business Directory
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Browse all verified businesses in Ibadan
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search name, service, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </motion.div>

        {/* Filters + Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-5 relative">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Category
                </label>
                <select
                  value={mainCategory}
                  onChange={(e) => {
                    setMainCategory(e.target.value);
                    setSubCategory("");
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {[
                    ...new Set(
                      listings
                        .map((i) =>
                          capitalizeFirst(
                            (i.category || "").split(".")[0] || i.category
                          )
                        )
                        .filter(Boolean)
                    ),
                  ]
                    .sort()
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={!mainCategory}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All</option>
                  {[
                    ...new Set(
                      listings
                        .filter(
                          (i) =>
                            capitalizeFirst(
                              (i.category || "").split(".")[0]
                            ) === mainCategory
                        )
                        .map((i) => {
                          const parts = (i.category || "").split(".");
                          return parts[1]
                            ? capitalizeFirst(parts[1])
                            : mainCategory;
                        })
                    ),
                  ]
                    .filter(Boolean)
                    .sort()
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Areas</option>
                  {[...new Set(listings.map((i) => i.area).filter(Boolean))]
                    .sort()
                    .map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-7 p-6 px-2 lg:px-5">
            {currentItems.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <i className="fas fa-box-open text-5xl text-gray-300 mb-4 block"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No businesses match your filters
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                {/* Animated Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {currentItems.map((item, i) => {
                    const itemId = `business-${item.id}`;
                    return (
                      <AppleCardWrapper key={itemId} index={i}>
                        <motion.div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
                          <ImageCarousel
                            card={item}
                            onImageClick={(images, idx) =>
                              setImageModal({
                                isOpen: true,
                                images,
                                initialIndex: idx,
                                item,
                              })
                            }
                          />
                          <div className="p-5 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name || "Unnamed"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                              {item.area || "Ibadan"}
                            </p>

                            {/* Description */}
                            <p className="text-gray-700 text-sm mb-3 flex-grow">
                              {expandedDescriptions[itemId]
                                ? item.short_desc
                                : item.short_desc?.slice(0, 80)}
                              {item.short_desc?.length > 80 && (
                                <button
                                  onClick={() =>
                                    setExpandedDescriptions((prev) => ({
                                      ...prev,
                                      [itemId]: !prev[itemId],
                                    }))
                                  }
                                  className="text-blue-600 ml-2 text-xs font-medium"
                                >
                                  {expandedDescriptions[itemId]
                                    ? "Show less"
                                    : "Read more"}
                                </button>
                              )}
                            </p>

                            {/* Rating & Price */}
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-[16px] text-gray-800">
                                ⭐ {item.rating || "N/A"}
                              </span>
                              <span className="font-bold text-[18px] text-gray-800">
                                ₦ {formatPrice(item.price_from)}
                              </span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              {item.tags?.split(",").map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>

                            {/* Contact / Review Buttons */}
                            <div className="mt-auto flex flex-wrap justify-between items-center gap-2 ">
                              <button
                                onClick={() => handleShowContact(itemId)}
                                className="flex items-center gap-2 text-sm bg-[rgb(0,6,90)] flex-1 justify-center  disabled:opacity-75 hover:bg-[rgb(15,19,71)] text-white px-3 py-2.5 rounded font-medium "
                              >
                                <FontAwesomeIcon icon={faComment} />
                                {showContact[itemId]
                                  ? formatWhatsapp(item.whatsapp)
                                  : "Contact"}
                                {showContact[itemId] && (
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="ml-1"
                                  />
                                )}
                              </button>

                              <button
                                onClick={() => openChat(item.name)}
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-gray-600 transition-colors"
                                aria-label="Open chat"
                              >
                                <FontAwesomeIcon
                                  icon={faComment}
                                  className="text-lg"
                                />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </AppleCardWrapper>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    {/* Previous Button */}
                    {currentPage > 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white border border-gray-300 transition"
                      >
                        Prev ←
                      </button>
                    )}

                    {/* Page Numbers — Mobile: only 1–4 (or up to totalPages if <4); Desktop: all pages */}
                    {Array.from({ length: Math.min(totalPages, 4) }).map(
                      (_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? "bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}

                    {/* Ellipsis + additional pages on medium+ screens only */}
                    {totalPages > 4 && (
                      <>
                        {/* Show “…” and remaining pages only on md and up */}
                        <span className="hidden md:inline-block px-3 py-1.5 text-sm text-gray-500">
                          …
                        </span>
                        {Array.from({ length: totalPages - 4 }, (_, idx) => {
                          const pageNum = idx + 5; // starts from 5
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`hidden md:inline-block px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                currentPage === pageNum
                                  ? "bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </>
                    )}

                    {/* Next Button */}
                    {currentPage < totalPages && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white transition"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      {imageModal.isOpen && (
        <ImageModal
          images={imageModal.images}
          initialIndex={imageModal.initialIndex}
          isOpen={imageModal.isOpen}
          onClose={() => setImageModal({ ...imageModal, isOpen: false })}
          item={imageModal.item}
        />
      )}
    </section>
  );
};

export default Directory;
