// src/hook/useGoogleSheet.jsx
import { useState, useEffect } from "react";

const useGoogleSheet = ({ sheetId, apiKey, webAppUrl }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sheetId && !webAppUrl) {
      setError("Provide either sheetId/apiKey OR webAppUrl");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        let result = [];

        if (webAppUrl) {
          const res = await fetch(webAppUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!Array.isArray(json))
            throw new Error("Web app did not return JSON array");
          result = json;
        } else {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();

          if (
            json.values &&
            Array.isArray(json.values) &&
            json.values.length > 1
          ) {
            const headers = json.values[0];
            const rows = json.values.slice(1);
            result = rows.map((row) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
              return obj;
            });
          }
        }

        setData(result);
      } catch (err) {
        console.error("Google Sheets fetch error:", err);
        setError(err.message || "Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, apiKey, webAppUrl]);

  return { data, loading, error };
};

export default useGoogleSheet;
