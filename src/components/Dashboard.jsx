// Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import NoDataMessage from "./NoDataMessage";
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
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faArrowUp,
  faArrowDown,
  faSun,
  faMoon,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* -----------------------------
   Hooks / helpers
   ----------------------------- */

// Fetch data from Google Sheets
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
        setError(
          "Failed to load Dashboard data. Try reloading the page and check your internet connection"
        );
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

// Dark mode hook
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

  const toggleDarkMode = () => setIsDarkMode((s) => !s);

  return { isDarkMode, toggleDarkMode };
};

// Count up animation (safe)
const useCountUp = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const animate = (time) => {
    if (startTimeRef.current === undefined) {
      startTimeRef.current = time;
    }
    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 2);
    const current = Math.floor(easeOut * targetRef.current);
    setCount(current);
    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setCount(targetRef.current);
    }
  };

  useEffect(() => {
    if (target > 0) {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    } else {
      setCount(target);
    }
  }, [target, duration]);

  return count;
};

/* -----------------------------
   Small presentational components
   (accept `start` prop so hooks inside them don't run until needed)
   ----------------------------- */

const AnimatedBarLabel = ({ x, y, width, value, start = false }) => {
  const animatedValue = useCountUp(start ? value : 0, 1200);

  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="#444"
      fontSize="11px"
      fontWeight="500"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {animatedValue >= 1000
        ? `₦${(animatedValue / 1000).toFixed(0)}k`
        : `₦${animatedValue}`}
    </text>
  );
};

const PriceCard = ({
  title,
  value,
  change,
  icon,
  color,
  isPrice,
  hideValue,
  isDarkMode,
  start = false,
}) => {
  const animatedValue = useCountUp(start ? value : 0, 1200);
  const displayValue = hideValue
    ? "—"
    : isPrice
    ? `₦${animatedValue.toLocaleString()}`
    : animatedValue;

  return (
    <div
      className={`p-4 rounded-lg shadow border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <h4
        className={`text-xs md:text-sm font-medium ${
          isDarkMode ? "text-blue-400" : "text-[#101828]"
        }`}
      >
        {title}
      </h4>
      <div className="text-xl font-bold mt-1">{displayValue}</div>
      <div className={`text-xs mt-1 flex items-center ${color}`}>
        <FontAwesomeIcon icon={icon} className="mr-1" /> {change}
      </div>
    </div>
  );
};

const AnimatedYAxisTick = ({ x, y, payload, isDarkMode, start = false }) => {
  const animatedValue = useCountUp(start ? payload.value : 0, 800);
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      fill={isDarkMode ? "#aaa" : "#666"}
      fontSize={12}
    >
      {animatedValue >= 1000
        ? `₦${(animatedValue / 1000).toFixed(0)}k`
        : `₦${animatedValue}`}
    </text>
  );
};

/* -----------------------------
   Main Dashboard component
   ----------------------------- */

const Dashboard = () => {
  const SHEET_ID = import.meta.env.VITE_SHEET_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;


  // DATA + UI hooks (these must be declared before any early returns)
  const {
    data: vendors,
    loading: dataLoading,
    error,
    refetch,
  } = useGoogleSheet(SHEET_ID, API_KEY);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Intersection observers (must be at top-level)
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [cardsRef, cardsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [barRef, barInView] = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });
  const [lineRef, lineInView] = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });
  const [footerRef, footerInView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  // UI state
  const [showContent, setShowContent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    "accommodation.hotel"
  );
  const [selectedArea, setSelectedArea] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);

  // Autocomplete state
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Show content delay (keeps your original logic)
  useEffect(() => {
    if (error) {
      setShowContent(true);
      return;
    }
    const timer = setTimeout(() => setShowContent(true), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const safeVendors = Array.isArray(vendors) ? vendors : [];

  // Unique areas
  const allAreas = Array.from(
    new Set(safeVendors.map((v) => v.area?.trim()).filter(Boolean))
  ).sort();

  // Filter logic
  const filteredVendors = safeVendors.filter((vendor) => {
    const matchesCategory =
      selectedCategory === "All" || vendor.category === selectedCategory;
    const matchesArea =
      !selectedArea ||
      vendor.area?.toLowerCase().includes(selectedArea.toLowerCase());
    return matchesCategory && matchesArea;
  });

  // Monthly price index
  const monthlyPriceIndex = {};
  filteredVendors.forEach((vendor) => {
    const dateStr = vendor.updated_at;
    if (!dateStr) return;
    const [year, month] = dateStr.split("-").slice(0, 2);
    const monthKey = `${year}-${month}`;
    const price = parseFloat(vendor.price_from) || 0;
    if (!monthlyPriceIndex[monthKey]) {
      monthlyPriceIndex[monthKey] = { total: 0, count: 0 };
    }
    monthlyPriceIndex[monthKey].total += price;
    monthlyPriceIndex[monthKey].count += 1;
  });

  const monthlyAverages = Object.keys(monthlyPriceIndex)
    .map((key) => ({
      month: key,
      avg: Math.round(
        monthlyPriceIndex[key].total / monthlyPriceIndex[key].count
      ),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const currentMonthAvg = monthlyAverages[monthlyAverages.length - 1]?.avg || 0;
  const previousMonthAvg =
    monthlyAverages[monthlyAverages.length - 2]?.avg || 0;

  const changePercent =
    previousMonthAvg > 0
      ? ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100
      : 0;

  const changeText =
    changePercent > 0
      ? `+${changePercent.toFixed(1)}% from last month`
      : changePercent < 0
      ? `${changePercent.toFixed(1)}% from last month`
      : "No change";

  // Chart data
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

  const categories = {
    accommodation: ["hotel", "shortlet", "guesthouse", "resorts", "airbnb"],
    transport: ["taxi", "bus", "bike", "carrental", "dispatch"],
    event: ["cinema", "club", "park", "weekend", "concert", "art", "tech"],
  };

  const getMainCategory = (cat) => cat.split(".")[0] || "accommodation";
  const getSubCategory = (cat) => cat.split(".")[1] || "hotel";
  const updateSelectedCategory = (newMain, newSub) => {
    setSelectedCategory(`${newMain}.${newSub}`);
  };

  // Auto-refetch
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 90000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Pull-to-refresh handlers
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

  const handleBarClick = (data) => {
    setSelectedArea(data.area);
  };

  // Early returns (hooks already declared above)
  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-red-400" : "bg-gray-100 text-red-600"
        }`}
      >
        <div className="text-center">
          <p className="text-xl font-bold font-rubik">⚠️</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-[#eef8fd] text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-rubik">Loading Ajani Dashboard...</p>
        </div>
      </div>
    );
  }

  const sortedAvgPricesArray = [...avgPricesArray].sort((a, b) =>
    a.area.localeCompare(b.area)
  );

  return (
    <section
      id="priceinsight"
      ref={sectionRef}
      className={`min-h-screen transition-colors duration-300  overflow-hidden ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-[#eef8fd] text-gray-900"
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
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 18 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-between items-center mb-6"
          >
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
          </motion.div>

          {/* Instruction Banner */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className={`mb-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 ${
              isDarkMode ? "bg-blue-900/20 text-blue-100" : "text-blue-800"
            }`}
          >
            <div className="flex items-start space-x-2">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className={`mt-0.5 text-blue-500 ${
                  isDarkMode ? "text-blue-300" : ""
                }`}
              />
              <div>
                <h3 className="font-semibold text-sm">
                  Select Category & Subcategory
                </h3>
                <p className="text-xs mt-1">
                  Choose a main category (e.g., Accommodation) and a subcategory
                  (e.g., Hotel) to see real-time price insights.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.16 }}
            className="flex flex-col gap-3 mb-6"
          >
            <div className="flex flex-row gap-3">
              {/* Main Category */}
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="main-category"
                  className={`text-xs font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Main Category
                </label>
                <select
                  id="main-category"
                  value={getMainCategory(selectedCategory)}
                  onChange={(e) => {
                    const newMain = e.target.value;
                    const currentSub = getSubCategory(selectedCategory);
                    const validSubs = categories[newMain] || [];
                    const newSub = validSubs.includes(currentSub)
                      ? currentSub
                      : validSubs[0] || "hotel";
                    updateSelectedCategory(newMain, newSub);
                  }}
                  className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 w-full ${
                    isDarkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  {Object.keys(categories).map((main) => (
                    <option key={main} value={main}>
                      {main.charAt(0).toUpperCase() + main.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="subcategory"
                  className={`text-xs font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  value={getSubCategory(selectedCategory)}
                  onChange={(e) => {
                    const newSub = e.target.value;
                    const currentMain = getMainCategory(selectedCategory);
                    updateSelectedCategory(currentMain, newSub);
                  }}
                  className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 w-full ${
                    isDarkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  disabled={!getMainCategory(selectedCategory)}
                >
                  {categories[getMainCategory(selectedCategory)]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub.charAt(0).toUpperCase() + sub.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area Input */}
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
          </motion.div>

          {/* Cards */}
          <motion.div
            ref={cardsRef}
            initial="hidden"
            animate={cardsInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: {} }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
          >
            {[
              {
                title: "Price Index",
                value: currentMonthAvg,
                change: changeText,
                icon: changePercent >= 0 ? faArrowUp : faArrowDown,
                color: changePercent >= 0 ? "text-green-500" : "text-red-500",
                isPrice: true,
              },
              {
                title: "Most Affordable Area",
                value: selectedCategory.startsWith("accommodation.")
                  ? affordableArea.price
                  : 0,
                change: selectedCategory.startsWith("accommodation.")
                  ? `${Math.round(
                      ((priceIndex - affordableArea.price) / priceIndex) * 100
                    )}% below avg`
                  : "No data applicable",
                icon: faArrowDown,
                color: selectedCategory.startsWith("accommodation.")
                  ? "text-green-500"
                  : "text-gray-500",
                isPrice: true,
                hideValue: !selectedCategory.startsWith("accommodation."),
              },
              {
                title: "Price Alert",
                value: alertArea.price,
                change: `${Math.round(
                  ((alertArea.price - priceIndex) / priceIndex) * 100
                )}% increase`,
                icon: faArrowUp,
                color: "text-red-500",
                isPrice: true,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={cardsInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.12 + i * 0.12,
                  ease: "easeOut",
                }}
              >
                <PriceCard
                  {...card}
                  isDarkMode={isDarkMode}
                  start={cardsInView}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              ref={barRef}
              initial={{ opacity: 0, y: 18 }}
              animate={barInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
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

              {sortedAvgPricesArray.length === 0 ? (
                <NoDataMessage
                  onReset={() => {
                    setSelectedCategory("accommodation.hotel");
                    setSelectedArea("");
                  }}
                  isDarkMode={isDarkMode}
                />
              ) : (
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
                      tick={(props) => (
                        <AnimatedYAxisTick
                          {...props}
                          isDarkMode={isDarkMode}
                          start={barInView}
                        />
                      )}
                      domain={[0, "auto"]}
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
                      fill="#05f2c1"
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      <LabelList
                        dataKey="price"
                        content={(props) => (
                          <AnimatedBarLabel {...props} start={barInView} />
                        )}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              ref={lineRef}
              initial={{ opacity: 0, y: 18 }}
              animate={lineInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
              className={`p-4 rounded-lg shadow border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              style={{ outline: "none" }}
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

              {monthlyAverages.length === 0 ? (
                <NoDataMessage
                  onReset={() => {
                    setSelectedCategory("accommodation.hotel");
                    setSelectedArea("");
                  }}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div tabIndex="-1" style={{ outline: "none" }}>
                  <ResponsiveContainer
                    width="100%"
                    height={250}
                    margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
                  >
                    <LineChart data={monthlyAverages}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? "#333" : "#eee"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke={isDarkMode ? "#aaa" : "#666"}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(tick) => {
                          const [year, month] = tick.split("-");
                          return `${month}/${year.slice(2)}`;
                        }}
                        interval="preserveStartEnd"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={(props) => (
                          <AnimatedYAxisTick
                            {...props}
                            isDarkMode={isDarkMode}
                            start={lineInView}
                          />
                        )}
                        domain={[0, "auto"]}
                      />

                      <Tooltip
                        formatter={(v) => [
                          `₦${v.toLocaleString()}`,
                          "Price Index",
                        ]}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                        itemStyle={{ color: isDarkMode ? "#fff" : "#333" }}
                      />
                      <Line
                        type="linear"
                        dataKey="avg"
                        stroke="#05f2c1"
                        strokeWidth={2}
                        dot={{
                          r: 3,
                          fill: "#05f2c1",
                          stroke: isDarkMode ? "#000" : "#fff",
                          strokeWidth: 1,
                        }}
                        activeDot={{
                          r: 5,
                          fill: "#05f2c1",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            ref={footerRef}
            initial={{ opacity: 0, y: 18 }}
            animate={footerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className={`text-xs text-center ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Results: {filteredVendors.length} places • Data source: Google
            Sheets • Prices indicative.
          </motion.div>
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
