// src/components/GoogleSheetsTest.jsx
import React, { useState, useEffect } from 'react';

const GoogleSheetsTest = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testGoogleSheetsConnection();
  }, []);

  const testGoogleSheetsConnection = async () => {
    try {
      setLoading(true);
      
      // Test reading from your Google Sheet
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_SHEET_ID}/values/Catalog?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('Raw Google Sheets response:', result);

      // Convert rows to objects
      if (result.values && result.values.length > 0) {
        const headers = result.values[0]; // First row is headers
        const rows = result.values.slice(1); // Rest are data rows
        
        const formattedData = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        setData(formattedData);
        console.log('Formatted data:', formattedData);
      }

    } catch (err) {
      console.error('Google Sheets test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center mt-2 text-blue-600">Testing Google Sheets connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-bold mb-2">❌ Connection Failed</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={testGoogleSheetsConnection}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Retry Test
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-green-800 font-bold mb-2">✅ Google Sheets Connected!</h3>
      <p className="text-green-600 text-sm mb-3">
        Found {data.length} items in your catalog
      </p>
      
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-xs bg-white rounded">
          <thead className="bg-gray-100">
            <tr>
              {data[0] && Object.keys(data[0]).map(key => (
                <th key={key} className="p-2 text-left border-b">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((row, index) => (
              <tr key={index} className="border-b">
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex} className="p-2 truncate max-w-xs">
                    {value || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5 && (
          <p className="text-gray-500 text-xs mt-2">
            Showing first 5 of {data.length} items
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleSheetsTest;