import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faStore } from "@fortawesome/free-solid-svg-icons";

// ✅ Hardcoded fallback images by ID and category
const FALLBACK_IMAGES = {
  // By ID (match your sheet's 'id' column)
  1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  2: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  3: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  // By category
  "hotel-default":
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "transport-default":
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  "event-default":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  // Add more as needed
};

// ✅ Custom Hook: Fetch Data from Google Sheets API
const useGoogleSheet = (sheetId, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fixed: Removed extra spaces around ${sheetId}
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`
        );
        const result = await response.json();

        if (result.values && result.values.length > 1) {
          const headers = result.values[0];
          const rows = result.values.slice(1);
          const formatted = rows.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || "";
            });
            return obj;
          });
          setData(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, apiKey]);

  return { data, loading, error };
};

// ✅ Image resolver with fallback logic
const getFallbackImage = (item) => {
  // 1. Try image from sheet (trim and validate)
  const sheetImage = (item.image_url || "").trim();
  if (sheetImage && sheetImage.startsWith("http")) {
    return sheetImage;
  }

  // 2. Try by ID
  if (item.id && FALLBACK_IMAGES[item.id]) {
    return FALLBACK_IMAGES[item.id];
  }

  // 3. Try by category
  if (item.category) {
    if (item.category.includes("hotel"))
      return FALLBACK_IMAGES["hotel-default"];
    if (item.category.includes("ridehail"))
      return FALLBACK_IMAGES["transport-default"];
    if (item.category.includes("event"))
      return FALLBACK_IMAGES["event-default"];
  }

  // 4. Final fallback
  return "https://via.placeholder.com/300x200?text=No+Image";
};

const Directory = () => {
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";

  const { data: listings, loading, error } = useGoogleSheet(SHEET_ID, API_KEY);

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Get unique areas
  const areas = [
    ...new Set(listings.map((item) => item.area).filter(Boolean)),
  ].sort();

  // Filter and paginate
  useEffect(() => {
    let result = listings.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        (item.short_desc &&
          item.short_desc.toLowerCase().includes(search.toLowerCase())) ||
        (item.tags && item.tags.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = category ? item.category === category : true;
      const matchesArea = area ? item.area === area : true;
      return matchesSearch && matchesCat && matchesArea;
    });

    setFiltered(result);
    setCurrentPage(1);
  }, [listings, search, category, area]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const formatPrice = (n) => (n ? n.toLocaleString() : "–");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 font-rubik">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 font-rubik">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section id="directory" className="max-w-7xl mx-auto px-5 py-12 font-rubik">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">Full Business Directory</h2>
          <p className="text-slate-600">
            Browse all verified businesses in Ibadan
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search businesses or items..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              {Array.from(new Set(listings.map((v) => v.category))).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              )}
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

        {/* Results */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg text-slate-500">
            <i className="fas fa-search text-4xl mb-4 block text-slate-400"></i>
            <h4 className="font-semibold mb-2">No results found</h4>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentItems.map((item) => (
                <div
                  key={item.id || item.name}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow hover:shadow-md hover:-translate-y-1 transition flex flex-col h-full"
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
                    <p className="text-slate-700 text-sm mb-3 flex-grow">
                      {item.short_desc}
                    </p>
                    <div className="font-bold mb-2">
                      From ₦{formatPrice(item.price_from)}
                    </div>
                    {item.rating && (
                      <div className="text-yellow-500 text-sm mb-2">
                        ⭐ {item.rating}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(item.tags ? item.tags.split(",") : []).map((tag, i) => {
                        const [name, price] = tag.trim().split(":");
                        return price ? (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {name} ₦{parseInt(price).toLocaleString()}
                          </span>
                        ) : (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-auto flex gap-2">
                      <a
                        href={`https://wa.me/${(item.whatsapp || "").replace(
                          /\D/g,
                          ""
                        )}?text=${encodeURIComponent(
                          "Tell me more about " + item.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex-1 justify-center"
                      >
                        <FontAwesomeIcon icon={faComment} /> Ask Ajani
                      </a>
                      <a
                        href="#vendors"
                        className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-2 rounded text-sm font-medium justify-center"
                      >
                        <FontAwesomeIcon icon={faStore} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 mx-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
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
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 mx-1 rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 mx-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Directory;
