// src/components/PriceInsights.jsx
import React, { useState, useEffect } from "react";

const PriceInsights = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Replace with your actual GAS URL
  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbzfPOJl8EQl4bRWC-hW-whFrpPkzGPEPqoRnEChzxRwocUlpiY33U8iCTlWVIde0Gm5/exec";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(GAS_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();

        if (Array.isArray(result)) {
          setData(result);
        } else if (result.error) {
          throw new Error(result.error);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("GAS Fetch error:", err);
        setError("Failed to load price data. Check console for details.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (n) => {
    if (n == null || n === "") return "–";
    const num = parseInt(n);
    if (num >= 1000) {
      const k = Math.floor(num / 1000);
      const remainder = num % 1000;
      return remainder === 0 ? `${k}k` : `${k}.${Math.floor(remainder / 100)}k`;
    }
    return num.toLocaleString();
  };

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
            <span className="font-bold text-green-600">
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
