import { useState, useEffect } from "react";

export const useDirectoryData = (sheetId, apiKey) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`
        );
        const data = await response.json();

        if (data.values?.length > 1) {
          const headers = data.values[0];
          const rows = data.values.slice(1);
          const formatted = rows.map((row) => {
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = row[i] || "";
            });
            return obj;
          });
          setListings(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load directory data.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [sheetId, apiKey]);

  return { listings, loading, error };
};
