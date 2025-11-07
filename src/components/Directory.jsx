import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faStore,
  faCopy,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useAuth } from "../hook/useAuth";
import AuthModal from "../components/ui/AuthModal";
import ImageModal from "../components/ImageModal";
import { useChat } from "../context/ChatContext";
import { useLocation } from "../hook/useLocation"; // ✅ Import hook

// ---------------- Helpers ----------------
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const FALLBACK_IMAGES = {
  1: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  2: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  "hotel-default":
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "transport-default":
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  "event-default":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default: "https://via.placeholder.com/300x200?text=No+Image",
};

const getCardImages = (item) => {
  const raw = item["image url"] || "";
  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u && (u.startsWith("http://") || u.startsWith("https://")));

  if (urls.length > 0) return urls;

  if (item.category?.toLowerCase().includes("hotel"))
    return [FALLBACK_IMAGES["hotel-default"]];
  if (item.category?.toLowerCase().includes("ridehail"))
    return [FALLBACK_IMAGES["transport-default"]];
  if (item.category?.toLowerCase().includes("event"))
    return [FALLBACK_IMAGES["event-default"]];
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
    const fetchData = async () => {
      try {
        // ✅ FIXED: No extra spaces
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.values && json.values.length > 1) {
          const headers = json.values[0];
          const rows = json.values.slice(1);
          const formatted = rows.map((row) => {
            const obj = {};
            headers.forEach((h, i) => (obj[h] = row[i] || ""));
            return obj;
          });
          setData(formatted);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Google Sheets fetch error:", err);
        setError("⚠️ Failed to load Directory data.");
      } finally {
        setLoading(false);
      }
    };
    if (sheetId && apiKey) fetchData();
    else {
      setError("Missing SHEET_ID or API_KEY");
      setLoading(false);
    }
  }, [sheetId, apiKey]);

  return { data, loading, error };
};

// ---------------- Motion Variants ----------------
const cardVariants = (index) => ({
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut", delay: index * 0.05 },
  },
  hover: {
    y: -8,
    scale: 1.025,
    transition: { type: "spring", stiffness: 300, damping: 20, mass: 0.8 },
  },
});

// ---------------- Image Carousel ----------------
const ImageCarousel = ({ card, onImageClick }) => {
  const images = getCardImages(card);
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  useEffect(() => {
    if (paused) return;
    timeoutRef.current = setTimeout(
      () => setIndex((prev) => (prev + 1) % images.length),
      4000
    );
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, images.length]);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);
  const handleTouchStart = (e) => {
    setPaused(true);
    setDragStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - dragStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((p) => (p - 1 + images.length) % images.length);
      else setIndex((p) => (p + 1) % images.length);
    }
    setPaused(false);
  };

  return (
    <div
      className="relative w-full h-44 md:h-52 overflow-hidden rounded-t-xl bg-slate-100 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onImageClick(images, index)}
    >
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${card.name || "image"}-${i}`}
            className="w-full h-full flex-shrink-0 object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
          />
        ))}
      </motion.div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === index ? "bg-white/90 scale-110 shadow" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// ---------------- Directory Component ----------------
const Directory = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    location,
    loading: locLoading,
    error: locError,
    requestLocation,
    getDistance,
  } = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    item: null,
  });

  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [useMyLocation, setUseMyLocation] = useState(false); // ✅ Location toggle

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const { openChat } = useChat();

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  const directoryRef = useRef(null);
  const [showContact, setShowContact] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [area, setArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setMainCategory("");
    setSubCategory("");
    setArea("");
    setUseMyLocation(false); // ✅ Reset location toggle
    setCurrentPage(1);
  };

  // Adjust items per page
  useEffect(() => {
    const check = () => setItemsPerPage(window.innerWidth >= 1024 ? 6 : 3);
    check();
    const handler = () => check();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Extract filter options
  const areas = [
    ...new Set(listings.map((i) => i.area).filter(Boolean)),
  ].sort();
  const mainCategories = [
    ...new Set(
      listings
        .map((i) => {
          const parts = i.category?.split(".") || [];
          return capitalizeFirst(parts[0]) || capitalizeFirst(i.category);
        })
        .filter(Boolean)
    ),
  ].sort();
  const subCategories = mainCategory
    ? [
        ...new Set(
          listings
            .filter((i) => {
              const parts = i.category?.split(".") || [];
              return capitalizeFirst(parts[0]) === mainCategory;
            })
            .map((i) => {
              const parts = i.category?.split(".") || [];
              return parts[1]
                ? capitalizeFirst(parts[1])
                : capitalizeFirst(i.category);
            })
            .filter(Boolean)
        ),
      ]
    : [];

  // ✅ Filtering with location support
  useEffect(() => {
    if (listings.length === 0) return;

    setIsFiltering(true);
    const timer = setTimeout(() => {
      let result = listings.filter((i) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          i.name?.toLowerCase().includes(q) ||
          i.short_desc?.toLowerCase().includes(q) ||
          i.tags?.toLowerCase().includes(q);

        const catParts = i.category?.split(".") || [];
        const mainCat =
          capitalizeFirst(catParts[0]) || capitalizeFirst(i.category);
        const subCat = catParts[1] ? capitalizeFirst(catParts[1]) : mainCat;

        const matchesMain = mainCategory ? mainCat === mainCategory : true;
        const matchesSub = subCategory ? subCat === subCategory : true;
        const matchesArea = area ? i.area === area : true;

        return matchesSearch && matchesMain && matchesSub && matchesArea;
      });

      // ✅ Apply location-based sorting (not filtering — preserves all)
      if (useMyLocation && location) {
        result = result
          .map((item) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const dist =
              !isNaN(lat) && !isNaN(lon)
                ? getDistance(location.lat, location.lon, lat, lon)
                : Infinity;
            return { ...item, distance: dist };
          })
          .sort((a, b) => a.distance - b.distance);
      }

      setFiltered(result);
      setCurrentPage(1);
      setIsFiltering(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [
    listings,
    search,
    mainCategory,
    subCategory,
    area,
    useMyLocation,
    location,
    getDistance,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const formatPrice = (n) => (n ? Number(n).toLocaleString() : "–");

  const handlePageChange = (page) => {
    setCurrentPage(page);
    directoryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShowContact = (itemName) => {
    if (authLoading) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setShowContact((prev) => ({ ...prev, [itemName]: true }));
    setTimeout(
      () => setShowContact((prev) => ({ ...prev, [itemName]: false })),
      20000
    );
  };

  useEffect(() => {
    if (user && isAuthModalOpen) setIsAuthModalOpen(false);
  }, [user, isAuthModalOpen]);

  // ✅ Handle location toggle
  const handleLocationToggle = async () => {
    if (useMyLocation) {
      setUseMyLocation(false);
    } else {
      try {
        await requestLocation();
        setUseMyLocation(true);
      } catch (err) {
        console.warn("Location access denied or unavailable");
      }
    }
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 text-center font-rubik">
        <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 rounded-full mx-auto"></div>
        <p className="mt-4">Loading directory...</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 text-center text-red-500 font-rubik">
        {error}
      </div>
    );

  return (
    <section
      ref={directoryRef}
      id="directory"
      className="bg-[#eef8fd] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-5 py-12 font-rubik">
        {/* Header + Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
          <div>
            <h2 className="text-3xl font-bold">Full Business Directory</h2>
            <p className="text-slate-600 mt-1 text-sm">
              Browse all verified businesses in Ibadan
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search businesses or items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Main Category
              </label>
              <select
                value={mainCategory}
                onChange={(e) => {
                  setMainCategory(e.target.value);
                  setSubCategory("");
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All main categories</option>
                {mainCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subcategory
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!mainCategory}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All subcategories</option>
                {subCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All areas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Location Toggle */}
            <div>
              <label className="block text-sm font-medium mb-1">&nbsp;</label>
              <label className="flex items-center cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={useMyLocation}
                  onChange={handleLocationToggle}
                  disabled={locLoading}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">
                  📍{" "}
                  {locLoading
                    ? "Locating..."
                    : useMyLocation
                    ? "Using location"
                    : "Use my location"}
                </span>
              </label>
              {locError && (
                <p className="text-xs text-red-500 mt-1">⚠️ {locError}</p>
              )}
            </div>
          </motion.div>

          {/* Results or Loading or Empty */}
          {isFiltering ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-600 rounded-full"></div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg text-slate-500">
              <i className="fas fa-filter-slash text-4xl mb-4 block text-slate-400"></i>
              <h4 className="font-semibold mb-2">No matching businesses</h4>
              <p className="mb-4">
                Try a different category, area, or keyword.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[rgb(0,6,90)] text-white rounded-lg text-sm font-medium hover:bg-[#0e1f45] transition"
              >
                🔁 Reset All Filters
              </button>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentItems.map((item, i) => (
                <motion.div
                  key={`${item.id || item.name}-${i}`}
                  variants={cardVariants(i)}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: false }}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow flex flex-col h-full"
                >
                  <ImageCarousel
                    card={item}
                    onImageClick={(images, index) =>
                      setImageModal({
                        isOpen: true,
                        images,
                        initialIndex: index,
                        item,
                      })
                    }
                  />

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <div className="text-sm text-slate-600 mb-2">
                      <span>{item.area}</span> • <span>{item.category}</span>
                      {/* ✅ Distance label */}
                      {useMyLocation && location && item.lat && item.lon ? (
                        <span className="block mt-1 text-xs text-slate-500">
                          📍{" "}
                          {(() => {
                            const d = getDistance(
                              location.lat,
                              location.lon,
                              parseFloat(item.lat),
                              parseFloat(item.lon)
                            );
                            return d < 100
                              ? `${d.toFixed(1)} km away`
                              : `>100 km`;
                          })()}
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={`text-slate-700 text-sm mb-3 ${
                        expandedDescriptions[item.name || item.id]
                          ? ""
                          : "line-clamp-4"
                      }`}
                    >
                      {item.short_desc || ""}
                    </p>
                    {item.short_desc && item.short_desc.length > 150 && (
                      <button
                        onClick={() =>
                          setExpandedDescriptions((prev) => ({
                            ...prev,
                            [item.name || item.id]: !prev[item.name || item.id],
                          }))
                        }
                        className="text-blue-600 text-sm font-medium mb-3 hover:underline"
                      >
                        {expandedDescriptions[item.name || item.id]
                          ? "See Less"
                          : "See More..."}
                      </button>
                    )}

                    {item.rating && (
                      <div className="flex items-center mb-3">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-yellow-500 mr-1"
                        />
                        <span className="text-sm font-medium">
                          {item.rating}
                        </span>
                      </div>
                    )}

                    <div className="font-bold mb-2">
                      From ₦{formatPrice(item.price_from)}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(item.tags ? item.tags.split(",") : []).map(
                        (tag, idx) => {
                          const [name, price] = tag.trim().split(":");
                          return price ? (
                            <span
                              key={idx}
                              className="bg-[#E6F2FF] text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                            >
                              {name} ₦{parseInt(price).toLocaleString()}
                            </span>
                          ) : (
                            <span
                              key={idx}
                              className="bg-gray-100 text-[#003366] px-3 py-1 rounded-lg text-sm"
                            >
                              {name}
                            </span>
                          );
                        }
                      )}
                    </div>

                    <div className="mt-auto flex gap-2">
                      {!showContact[item.name] ? (
                        <button
                          onClick={() => handleShowContact(item.name)}
                          disabled={authLoading}
                          className="flex-1 bg-[rgb(0,6,90)] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#0e1f45] flex items-center justify-center gap-2"
                        >
                          {authLoading ? (
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faComment} /> Show Contact
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex-1 flex justify-between items-center bg-green-100 px-3 py-2 rounded text-sm font-medium">
                          <span>
                            📞 {formatWhatsapp(item.whatsapp) || "N/A"}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                formatWhatsapp(item.whatsapp) || ""
                              );
                              alert("Number copied to clipboard!");
                            }}
                            className="ml-2 px-2 py-1 bg-green-700 text-white rounded text-xs"
                          >
                            <FontAwesomeIcon icon={faCopy} /> Copy
                          </button>
                        </div>
                      )}

                      <a
                        href="#vendors"
                        className="bg-slate-200 px-3 py-2 rounded text-sm flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faStore} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Auth Modal */}
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onAuthToast={(msg) => console.log("Auth toast:", msg)}
            />
          )}

          {/* Image Modal */}
          {imageModal.isOpen && (
            <ImageModal
              images={imageModal.images}
              initialIndex={imageModal.initialIndex}
              onClose={() =>
                setImageModal({
                  isOpen: false,
                  images: [],
                  initialIndex: 0,
                  item: null,
                })
              }
              item={imageModal.item}
              onAuthToast={(msg) => console.log("Auth toast:", msg)}
              onOpenChat={openChat}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && !isFiltering && (
            <motion.div className="flex justify-center mt-8 flex-wrap gap-2">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 mx-1 rounded bg-[rgb(0,6,90)] hover:bg-[#0e265c] text-white"
                >
                  Prev
                </button>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 3)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 rounded ${
                      currentPage === page
                        ? "bg-[rgb(0,6,90)] text-white"
                        : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 mx-1 rounded bg-[rgb(0,6,90)] hover:bg-[#0e265c] text-white"
                >
                  Next
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Directory;
