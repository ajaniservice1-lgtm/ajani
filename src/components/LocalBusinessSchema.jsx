// src/components/LocalBusinessSchema.jsx
import React from "react";
import { Helmet } from "react-helmet";

export default function LocalBusinessSchema({ vendor }) {
  if (!vendor) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: vendor.name,
    url: `https://ajani.ai/vendor/${vendor.slug}`,
    image: vendor["image url"]?.split(",")[0] || "",
    description: vendor.short_desc || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: vendor.address || "",
      addressLocality: vendor.area || "",
      addressRegion: vendor.region || "",
      postalCode: vendor.postalCode || "",
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: parseFloat(vendor.lat || 0),
      longitude: parseFloat(vendor.lon || 0),
    },
    telephone: vendor.whatsapp || "",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: parseFloat(vendor.rating || 5),
      reviewCount: parseInt(vendor.review_count || 0),
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
