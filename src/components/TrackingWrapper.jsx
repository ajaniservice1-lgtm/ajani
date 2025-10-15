// src/components/TrackingWrapper.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TrackingWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=G-NVNPQDL1WG`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", "G-NVNPQDL1WG", {
        anonymize_ip: true,
      });
    }
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-NVNPQDL1WG", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return children;
};

export default TrackingWrapper;
