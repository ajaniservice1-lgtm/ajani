import React, { useState, useEffect } from "react";

const PriceInsights = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔑 Replace these with your actual values
  const SHEET_ID = "1DS_FhKW-95K_UmBhSKOOLpFi6UVXAzj8IpBgFVmABiQ"; // ← your sheet ID
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";
  const RANGE = "Sheet1!A1:F10"; // ← adjust if your sheet has a different name or more rows

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.values || result.values.length === 0) {
          throw new Error("No data found in the sheet.");
        }

        const [headers, ...rows] = result.values;

        // Convert rows to array of objects
        const formattedData = rows.map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined ? row[index] : "";
          });
          return obj;
        });

        setData(formattedData);
      } catch (err) {
        console.error("Sheets API error:", err);
        setError("Failed to load price data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Your existing formatPrice function
  const formatPrice = (n) => {
    if (n == null || n === "") return "–";
    const num = parseInt(n, 10);
    if (isNaN(num)) return "–";
    if (num >= 1000) {
      const k = Math.floor(num / 1000);
      const remainder = num % 1000;
      return remainder === 0 ? `${k}k` : `${k}.${Math.floor(remainder / 100)}k`;
    }
    return num.toLocaleString();
  };

  // Loading & error UI (same as before)
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-center text-gray-500">Loading prices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md font-rubik">
      <h3 className="text-lg font-bold mb-4">Real-time price insights</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium">{item.item}</span>
            <span className="font-bold text-[#172c69] ">
              ₦{formatPrice(item.min_price)} – {formatPrice(item.max_price)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Updated weekly • Data from Ajani field reps & verified vendors
      </div>
    </div>
  );
};

export default PriceInsights;
