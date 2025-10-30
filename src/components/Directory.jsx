import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faStore, faCopy } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useAuth } from "../hook/useAuth";
import AuthModal from "../components/ui/AuthModal"; // ✅ Adjust path if needed

// ---------------- Helpers ----------------
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const FALLBACK_IMAGES = {
  1: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  2: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  3: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "hotel-default":
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "transport-default":
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  "event-default":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
};

const getFallbackImage = (item) => {
  const sheetImage = (item["image url"] || "").trim();
  if (sheetImage && sheetImage.startsWith("http")) return sheetImage;
  if (item.id && FALLBACK_IMAGES[item.id]) return FALLBACK_IMAGES[item.id];
  if (item.category?.includes("hotel")) return FALLBACK_IMAGES["hotel-default"];
  if (item.category?.includes("ridehail"))
    return FALLBACK_IMAGES["transport-default"];
  if (item.category?.includes("event")) return FALLBACK_IMAGES["event-default"];
  return "https://via.placeholder.com/300x200?text=No+Image";
};

// Format WhatsApp numbers neatly
const formatWhatsapp = (number) => {
  if (!number) return "";
  const digits = number.replace(/\D/g, "");
  let formatted = digits;
  if (digits.length === 10) {
    formatted = `+234 ${digits.slice(1, 4)} ${digits.slice(
      4,
      7
    )} ${digits.slice(7, 11)}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    formatted = `+234 ${digits.slice(1, 4)} ${digits.slice(
      4,
      7
    )} ${digits.slice(7, 11)}`;
  } else if (digits.length === 13 && digits.startsWith("234")) {
    formatted = `+234 ${digits.slice(3, 6)} ${digits.slice(
      6,
      9
    )} ${digits.slice(9, 13)}`;
  } else if (digits.length === 14 && digits.startsWith("2340")) {
    formatted = `+234 ${digits.slice(4, 7)} ${digits.slice(
      7,
      10
    )} ${digits.slice(10, 14)}`;
  } else {
    formatted = `+${digits}`;
  }
  return formatted;
};

// ---------------- Custom Hook ----------------
const useGoogleSheet = (sheetId, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`
        );
        const result = await response.json();
        if (result.values && result.values.length > 1) {
          const headers = result.values[0];
          const rows = result.values.slice(1);
          const formatted = rows.map((row) => {
            const obj = {};
            headers.forEach((header, i) => (obj[header] = row[i] || ""));
            return obj;
          });
          setData(formatted);
        }
      } catch (err) {
        console.error(err);
        setError(
          "⚠️ Failed to load Directory data. Check your internet connection."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sheetId, apiKey]);

  return { data, loading, error };
};

// ---------------- TruncatedText ----------------
const TruncatedText = ({ text, maxLines = 4 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text.length < 200)
    return <p className="text-slate-700 text-sm mb-3">{text}</p>;

  return (
    <div className="relative">
      <p
        className={`text-slate-700 text-sm mb-3 ${
          isExpanded ? "" : "line-clamp-4"
        }`}
        style={{
          WebkitLineClamp: isExpanded ? "unset" : maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
        }}
      >
        {text}
      </p>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-[#3276ee] text-sm font-medium hover:underline mt-1 block"
        >
          See More...
        </button>
      ) : (
        <button
          onClick={() => setIsExpanded(false)}
          className="text-blue-600 text-sm font-medium hover:underline mt-1 block"
        >
          See Less
        </button>
      )}
    </div>
  );
};

// ---------------- Motion Variants ----------------
const headerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const cardVariants = (index) => ({
  hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5 },
  },
  hover: { y: -5, scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.15)" },
});
const paginationVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------------- Directory Component ----------------
const Directory = () => {
  const { user, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";
  const { data: listings, loading, error } = useGoogleSheet(SHEET_ID, API_KEY);
  const directoryRef = useRef(null);

  const [showContact, setShowContact] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [area, setArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleShowContact = (itemName) => {
    if (authLoading) return;

    if (!user) {
      setIsModalOpen(true); // Open login modal for guests
      return;
    }

    // For logged-in users: show contact
    setShowContact((prev) => ({ ...prev, [itemName]: true }));
    setTimeout(() => {
      setShowContact((prev) => ({ ...prev, [itemName]: false }));
    }, 20000);
  };

  // ✅ Auto-show contact after login (optional but smooth)
  useEffect(() => {
    if (user && isModalOpen) {
      setIsModalOpen(false);
      // Optionally show a toast: onAuthToast("Now you can view contact details!");
    }
  }, [user, isModalOpen]);

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
            .filter(
              (i) =>
                capitalizeFirst((i.category?.split(".") || [])[0]) ===
                mainCategory
            )
            .map(
              (i) =>
                capitalizeFirst((i.category?.split(".") || [])[1]) ||
                capitalizeFirst(i.category)
            )
            .filter(Boolean)
        ),
      ]
    : [];

  useEffect(() => {
    const result = listings.filter((i) => {
      const matchesSearch =
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.short_desc?.toLowerCase().includes(search.toLowerCase()) ||
        i.tags?.toLowerCase().includes(search.toLowerCase());
      const catParts = i.category?.split(".") || [];
      const mainCat =
        capitalizeFirst(catParts[0]) || capitalizeFirst(i.category);
      const subCat = catParts[1] ? capitalizeFirst(catParts[1]) : mainCat;
      const matchesMain = mainCategory ? mainCat === mainCategory : true;
      const matchesSub = subCategory ? subCat === subCategory : true;
      const matchesArea = area ? i.area === area : true;
      return matchesSearch && matchesMain && matchesSub && matchesArea;
    });
    setFiltered(result);
    setCurrentPage(1);
  }, [listings, search, mainCategory, subCategory, area]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);
  const formatPrice = (n) => (n ? n.toLocaleString() : "–");

  const handlePageChange = (page) => {
    setCurrentPage(page);
    directoryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 font-rubik text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading directory...</p>
      </div>
    );
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 font-rubik text-center text-red-500">
        {error}
      </div>
    );

  return (
    <section ref={directoryRef} id="directory" className="bg-[#eef8fd]">
      <div className="max-w-7xl mx-auto px-5 py-12 font-rubik">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <motion.div
            whileInView="visible"
            initial="hidden"
            viewport={{ once: false }}
            variants={headerItem}
          >
            <motion.h2 className="text-3xl font-bold">
              Full Business Directory
            </motion.h2>
            <motion.p className="text-slate-600 mt-1">
              Browse all verified businesses in Ibadan
            </motion.p>
          </motion.div>
          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search businesses or items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters + Cards + Pagination */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </div>

          {/* Cards */}
          {currentItems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg text-slate-500">
              <i className="fas fa-search text-4xl mb-4 block text-slate-400"></i>
              <h4 className="font-semibold mb-2">No results found</h4>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentItems.map((item, index) => (
                <motion.div
                  key={`${item.id || item.name}-${currentPage}`}
                  variants={cardVariants(index)}
                  whileHover="hover"
                  whileInView="visible"
                  initial="hidden"
                  viewport={{ once: false }}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow flex flex-col h-full"
                >
                  <img
                    src={getFallbackImage(item)}
                    alt={item.name || "Business"}
                    className="w-full h-44 object-cover bg-slate-100"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Image+Not+Available";
                    }}
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <div className="text-sm text-slate-600 mb-2">
                      <span>{item.area}</span> • <span>{item.category}</span>
                    </div>
                    <TruncatedText text={item.short_desc} maxLines={4} />
                    <div className="font-bold mb-2">
                      From ₦{formatPrice(item.price_from)}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(item.tags ? item.tags.split(",") : []).map((tag, i) => {
                        const [name, price] = tag.trim().split(":");
                        return price ? (
                          <span
                            key={i}
                            className="bg-[#E6F2FF] text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {name} ₦{parseInt(price).toLocaleString()}
                          </span>
                        ) : (
                          <span
                            key={i}
                            className="bg-gray-100 text-[#003366] px-3 py-1 rounded-lg text-sm"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>

                    {/* Show Contact */}
                    <div className="mt-auto flex gap-2">
                      {!showContact[item.name] ? (
                        <button
                          onClick={() => handleShowContact(item.name)}
                          disabled={authLoading}
                          className="flex items-center gap-1 bg-[rgb(0,6,90)] hover:bg-[#0e1f45] duration-300 text-white px-3 py-2 rounded text-sm font-medium flex-1 justify-center shadow-[0px_4px_18px_rgba(0,0,0,0.1)] border border-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                        <div className="flex flex-1 items-center justify-between bg-green-100 px-3 py-2 rounded text-sm font-medium">
                          <span>
                            📞{" "}
                            {formatWhatsapp(item.whatsapp) ||
                              "No number available"}
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
                        className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-2 rounded text-sm font-medium justify-center"
                      >
                        <FontAwesomeIcon icon={faStore} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Auth Modal for Guests */}
          {isModalOpen && (
            <AuthModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAuthToast={(msg) => {
                console.log("Auth toast:", msg);
              }}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              variants={paginationVariants}
              whileInView="visible"
              initial="hidden"
              viewport={{ once: false }}
              className="flex justify-center mt-8"
            >
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 mx-1 rounded bg-[#172c69] hover:bg-[#19243b] duration-300 text-white"
                >
                  Prev
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 1),
                  Math.min(totalPages, currentPage + 2)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 rounded ${
                      currentPage === page
                        ? "bg-[rgb(0,6,90)] hover:bg-[#0e265c] duration-300 text-white"
                        : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 mx-1 rounded bg-[#172c69] hover:bg-[#19243b] duration-300 text-white"
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
