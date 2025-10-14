import { useState, useEffect } from "react";
// ✅ Custom Hook: Fetch Data from Google Apps Script Web App
// ✅ Custom Hook: Fetch Data from Google Apps Script Web App
const useGoogleSheet = (webAppUrl) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(webAppUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();

        if (Array.isArray(result)) {
          setData(result);
        } else {
          setError(result.error || "Unknown error");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [webAppUrl]);

  return { data, loading, error };
};