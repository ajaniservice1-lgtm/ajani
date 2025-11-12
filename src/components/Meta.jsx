// src/components/Meta.jsx
import { useEffect } from "react";

const Meta = ({
  title = "Ajani Directory | Find Trusted Local Businesses in Nigeria",
  description = "Discover top-rated local businesses near you — from restaurants to tech services — verified and powered by AI recommendations.",
  url = "https://ajani.ai/",
  image = "https://res.cloudinary.com/debpabo0a/image/upload/v1762942364/yp4z66xycbjcldfocrzc.jpg",
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const updateMeta = (selector, attr, value) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        const key = selector.includes("property") ? "property" : "name";
        tag.setAttribute(key, attr);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };

    // Basic SEO
    updateMeta('meta[name="description"]', "description", description);

    // Canonical link
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Open Graph
    updateMeta('meta[property="og:type"]', "og:type", "website");
    updateMeta('meta[property="og:url"]', "og:url", url);
    updateMeta('meta[property="og:title"]', "og:title", title);
    updateMeta(
      'meta[property="og:description"]',
      "og:description",
      description
    );
    updateMeta('meta[property="og:image"]', "og:image", image);

    // Twitter Card
    updateMeta(
      'meta[name="twitter:card"]',
      "twitter:card",
      "summary_large_image"
    );
    updateMeta('meta[name="twitter:title"]', "twitter:title", title);
    updateMeta(
      'meta[name="twitter:description"]',
      "twitter:description",
      description
    );
    updateMeta('meta[name="twitter:image"]', "twitter:image", image);
  }, [title, description, url, image]);

  return null; // No JSX needed
};

export default Meta;
