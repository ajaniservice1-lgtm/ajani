import React, { useState, useEffect } from "react";
import { LabelList } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell, // ✅ Re-add this
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faArrowUp,
  faArrowDown,
  faLayerGroup,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";

// ✅ Custom Hook: Fetch Data from Google Sheet
const useGoogleSheet = (sheetId, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Fixed URL: removed extra spaces
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`
        );
        const result = await response.json();

        if (
          result.values &&
          Array.isArray(result.values) &&
          result.values.length > 1
        ) {
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
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Check console for details.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, apiKey, lastFetch]);

  const refetch = () => setLastFetch(Date.now());

  return { data, loading, error, refetch };
};

// ✅ Dark Mode Hook — defaults to LIGHT on first load
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggleDarkMode };
};

const Dashboard = () => {
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";

  const {
    data: vendors,
    loading: dataLoading,
    error,
    refetch,
  } = useGoogleSheet(SHEET_ID, API_KEY);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // ✅ Delay content display by 3 seconds
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (error) {
      setShowContent(true);
      return;
    }
    const timer = setTimeout(() => setShowContent(true), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArea, setSelectedArea] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);

  // ✅ Autocomplete state
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [activeCategories, setActiveCategories] = useState({
    Accommodation: true,
    Transportation: true,
    "Weekend Event": true,
  });

  const safeVendors = Array.isArray(vendors) ? vendors : [];

  // ✅ Get unique areas for suggestions
  const allAreas = Array.from(
    new Set(safeVendors.map((v) => v.area?.trim()).filter(Boolean))
  ).sort();

  // ✅ Filter vendors (case-insensitive area match)
  const filteredVendors = safeVendors.filter((vendor) => {
    const matchesCategory =
      selectedCategory === "All" || vendor.category === selectedCategory;
    const matchesArea =
      !selectedArea ||
      vendor.area?.toLowerCase().includes(selectedArea.toLowerCase());
    return matchesCategory && matchesArea;
  });

  // ✅ Calculate monthly price index
  const monthlyPriceIndex = {};

  filteredVendors.forEach((vendor) => {
    const dateStr = vendor.updated_at; // e.g., "2025-09-13"
    if (!dateStr) return;

    const [year, month] = dateStr.split("-").slice(0, 2);
    const monthKey = `${year}-${month}`; // e.g., "2025-09"

    const price = parseFloat(vendor.price_from) || 0;
    if (!monthlyPriceIndex[monthKey]) {
      monthlyPriceIndex[monthKey] = { total: 0, count: 0 };
    }
    monthlyPriceIndex[monthKey].total += price;
    monthlyPriceIndex[monthKey].count += 1;
  });

  // ✅ Convert to array and sort by month
  const monthlyAverages = Object.keys(monthlyPriceIndex)
    .map((key) => ({
      month: key,
      avg: Math.round(
        monthlyPriceIndex[key].total / monthlyPriceIndex[key].count
      ),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ✅ Get current and previous month
  const currentMonthAvg = monthlyAverages[monthlyAverages.length - 1]?.avg || 0;
  const previousMonthAvg =
    monthlyAverages[monthlyAverages.length - 2]?.avg || 0;

  // ✅ Calculate percentage change
  const changePercent =
    previousMonthAvg > 0
      ? ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100
      : 0;

  // ✅ Format for display
  const changeText =
    changePercent > 0
      ? `+${changePercent.toFixed(1)}% from last month`
      : changePercent < 0
      ? `${changePercent.toFixed(1)}% from last month`
      : "No change";

  // === CHART DATA ===
  const averagePricesByArea = filteredVendors.reduce((acc, vendor) => {
    const area = vendor.area;
    const price = parseFloat(vendor.price_from) || 0;
    if (!acc[area]) acc[area] = { total: 0, count: 0 };
    acc[area].total += price;
    acc[area].count += 1;
    return acc;
  }, {});

  const avgPricesArray =
    Object.keys(averagePricesByArea).length > 0
      ? Object.keys(averagePricesByArea).map((area) => ({
          area,
          price: Math.round(
            averagePricesByArea[area].total / averagePricesByArea[area].count
          ),
        }))
      : [];

  const priceIndex = avgPricesArray.length
    ? Math.round(
        avgPricesArray.reduce((sum, item) => sum + item.price, 0) /
          avgPricesArray.length
      )
    : 0;

  const affordableArea =
    avgPricesArray.length > 0
      ? avgPricesArray.reduce(
          (min, area) => (area.price < min.price ? area : min),
          avgPricesArray[0]
        )
      : { area: "—", price: 0 };

  const alertArea =
    avgPricesArray.length > 0
      ? avgPricesArray.reduce(
          (max, area) => (area.price > max.price ? area : max),
          avgPricesArray[0]
        )
      : { area: "—", price: 0 };

  const COLORS = ["#101828", "#05f2c1", "#3276ee"];

  // Auto-refetch every 90 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 90000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleBarClick = (data) => {
    setSelectedArea(data.area);
  };

  // ✅ Pull-to-refresh
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (!pullStartY) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY;
    if (diff > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPulling(true);
    }
  };

  const handleTouchEnd = () => {
    if (pulling) {
      refetch();
    }
    setPulling(false);
    setPullStartY(0);
  };

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-red-400" : "bg-gray-100 text-red-600"
        }`}
      >
        <div className="text-center">
          <p className="text-xl font-bold font-rubik">
            ⚠️ Error Loading Data..
          </p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-rubik">Loading Ajani Dashboard...</p>
        </div>
      </div>
    );
  }

  // After calculating sortedAvgPricesArray
  const sortedAvgPricesArray = [...avgPricesArray].sort((a, b) =>
    a.area.localeCompare(b.area)
  );

  // ✅ Add this safety guard
  if (!sortedAvgPricesArray || sortedAvgPricesArray.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for selected filters.
      </div>
    );
  }
  return (
    <section
      id="priceinsight"
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className="min-h-screen max-w-7xl mx-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-4 md:p-6 font-rubik">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-[#101828]"
              } `}
            >
              Ajani — Ibadan Price Insights
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-yellow-300"
                  : "bg-gray-200 text-gray-700"
              }`}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 min-w-[120px] ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <option value="All">All Categories</option>
              <option value="accommodation.hotel">Accommodation</option>
              <option value="transport.ridehail">Transportation</option>
              <option value="event.weekend">Weekend Event</option>
            </select>

            {/* ✅ Area Input with Autocomplete */}
            <div className="relative min-w-[120px] flex-1">
              <input
                type="text"
                value={selectedArea}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedArea(val);
                  if (val.trim() === "") {
                    setAreaSuggestions([]);
                    setShowSuggestions(false);
                  } else {
                    const matches = allAreas.filter((area) =>
                      area.toLowerCase().includes(val.toLowerCase())
                    );
                    setAreaSuggestions(matches);
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (selectedArea.trim() !== "") {
                    const matches = allAreas.filter((area) =>
                      area.toLowerCase().includes(selectedArea.toLowerCase())
                    );
                    setAreaSuggestions(matches);
                  } else {
                    setAreaSuggestions(allAreas);
                  }
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Area: Bodija"
                className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 w-full ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && areaSuggestions.length > 0 && (
                <ul
                  className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto ${
                    isDarkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  {areaSuggestions.map((area, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSelectedArea(area);
                        setShowSuggestions(false);
                      }}
                      className={`px-3 py-2 cursor-pointer hover:${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {[
              {
                title: "Price Index",
                value: `₦${currentMonthAvg.toLocaleString()}`,
                change: changeText,
                icon: changePercent >= 0 ? faArrowUp : faArrowDown,
                color: changePercent >= 0 ? "text-green-500" : "text-red-500",
              },
              {
                title: "Most Affordable Area",
                value: affordableArea.area,
                change: `${Math.round(
                  ((priceIndex - affordableArea.price) / priceIndex) * 100
                )}% below avg`,
                icon: faArrowDown,
                color: "text-green-500",
              },
              {
                title: "Price Alert",
                value: alertArea.area,
                change: `${Math.round(
                  ((alertArea.price - priceIndex) / priceIndex) * 100
                )}% increase`,
                icon: faArrowUp,
                color: "text-red-500",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg shadow border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h4
                  className={`text-xs md:text-sm font-medium ${
                    isDarkMode ? "text-blue-400" : "text-[#101828]"
                  }`}
                >
                  {card.title}
                </h4>
                <div className="text-xl font-bold mt-1">{card.value}</div>
                <div className={`text-xs mt-1 flex items-center ${card.color}`}>
                  <FontAwesomeIcon icon={card.icon} className="mr-1" />{" "}
                  {card.change}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart — Average Prices by Area */}
            <div
              className={`p-4 rounded-lg shadow border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`font-semibold text-sm ${
                    isDarkMode ? "text-white" : "text-[#101828]"
                  }`}
                >
                  Average Prices by Area
                </h3>
                <span className="bg-blue-100 p-2 rounded-full">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-[#1ab9d6] text-xs"
                  />
                </span>
              </div>

              {/* ✅ Safety Check */}
              {sortedAvgPricesArray && sortedAvgPricesArray.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={sortedAvgPricesArray}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#333" : "#eee"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="area"
                      stroke={isDarkMode ? "#aaa" : "#666"}
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={isDarkMode ? "#aaa" : "#666"}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => {
                        if (v >= 1000) return `₦${(v / 1000).toFixed(0)}k`;
                        return `₦${v}`;
                      }}
                      domain={[0, "auto"]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [`₦${v.toLocaleString()}`, "Price"]}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                        border: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: isDarkMode ? "#fff" : "#333" }}
                    />
                    <Bar
                      dataKey="price"
                      onClick={handleBarClick}
                      style={{ cursor: "pointer" }}
                      fill="#05f2c1" // ✅ Single color to avoid Cell issues
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      <LabelList
                        dataKey="price"
                        position="top"
                        formatter={(value) => {
                          if (value >= 1000)
                            return `₦${(value / 1000).toFixed(0)}k`;
                          return `₦${value}`;
                        }}
                        style={{
                          fontSize: "11px",
                          fill: isDarkMode ? "#e0e0e0" : "#444",
                          fontWeight: "500",
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No data available for selected filters.
                </div>
              )}
            </div>

            {/* Line Chart - Monthly Price Trends */}
            <div
              className={`p-4 rounded-lg shadow border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`font-semibold text-sm ${
                    isDarkMode ? "text-white" : "text-[#101828]"
                  }`}
                >
                  Monthly Price Trends
                </h3>
                <span className="bg-blue-100 p-2 rounded-full">
                  <FontAwesomeIcon
                    icon={faArrowUp}
                    className="text-[#1ab9d6] text-xs"
                  />
                </span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyAverages}>
                  {/* Gridlines */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#333" : "#eee"}
                    vertical={false} // optional: remove vertical grid if you want clean look
                  />

                  {/* X-Axis: Month/Year format */}
                  <XAxis
                    dataKey="month"
                    stroke={isDarkMode ? "#aaa" : "#666"}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(tick) => {
                      const [year, month] = tick.split("-");
                      return `${month}/${year.slice(2)}`; // e.g., "09/25"
                    }}
                    interval="preserveStartEnd" // show all ticks
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* Y-Axis: Format as ₦0, ₦20,000, ₦40,000, etc. */}
                  <YAxis
                    stroke={isDarkMode ? "#aaa" : "#666"}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => {
                      if (v >= 100000) return `₦${(v / 1000).toFixed(0)}k`;
                      if (v >= 10000) return `₦${(v / 1000).toFixed(0)}k`;
                      return `₦${v}`;
                    }}
                    domain={[0, "auto"]} // auto-scale based on data
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* Tooltip */}
                  <Tooltip
                    formatter={(v) => [`₦${v.toLocaleString()}`, "Price Index"]}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                      border: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: isDarkMode ? "#fff" : "#333" }}
                  />

                  {/* Line with Animation & Small Dots */}
                  <Line
                    type="linear"
                    dataKey="avg"
                    stroke="#05f2c1"
                    strokeWidth={2}
                    dot={{
                      r: 3, // ✅ Smaller dot
                      fill: "#05f2c1",
                      stroke: isDarkMode ? "#000" : "#fff", // subtle outline
                      strokeWidth: 1,
                    }}
                    activeDot={{
                      r: 5,
                      fill: "#05f2c1",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    animationDuration={1500} // ✅ Smooth animation on load
                    animationEasing="ease-out"
                    onMouseEnter={() => {
                      document.body.style.cursor = "pointer";
                    }}
                    onMouseLeave={() => {
                      document.body.style.cursor = "default";
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`text-xs text-center ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Results: {filteredVendors.length} places • Data source: Google
            Sheets • Prices indicative.
          </div>
        </div>

        {/* Pull-to-refresh indicator */}
        {pulling && (
          <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm z-50 font-rubik">
            Release to refresh...
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
