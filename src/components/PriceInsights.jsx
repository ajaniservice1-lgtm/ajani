import React, { useState, useEffect, useRef } from "react";

// Custom hook for counting animation
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

// Child component to safely use hooks
const PriceItem = ({ item }) => {
  const minNum = parseInt(item.min_price, 10) || 0;
  const maxNum = parseInt(item.max_price, 10) || 0;

  const animatedMin = useCountUp(minNum, 1200);
  const animatedMax = useCountUp(maxNum, 1200);

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

  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="font-medium">{item.item}</span>
      <span className="font-bold text-[#172c69]">
        ₦{formatPrice(animatedMin)} – {formatPrice(animatedMax)}
      </span>
    </div>
  );
};

const PriceInsights = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SHEET_ID = "1DS_FhKW-95K_UmBhSKOOLpFi6UVXAzj8IpBgFVmABiQ";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";
  const RANGE = "Sheet1!A1:F10";

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
    <div className="p-6 bg-white rounded-lg shadow-md  font-rubik">
      <h3 className="text-lg font-bold mb-4">Real-time price insights</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <PriceItem key={item.item || index} item={item} /> // ✅ Unique key!
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Updated weekly • Data from Ajani field reps & verified vendors
      </div>
    </div>
  );
};

export default PriceInsights;
