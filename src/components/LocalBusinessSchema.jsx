// components/LocalBusinessSchema.jsx
import { Helmet } from "react-helmet";

export default function LocalBusinessSchema() {
  const businessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "AjaniAI",
    url: "https://ajani.ai",
    logo: "https://res.cloudinary.com/debpabo0a/image/upload/v1761912981/wi5ff9fjsrgvduiq1zlk.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+2348055088030",
      contactType: "customer service",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "7 Oluyoro St, off Awolowo Avenue, Old Bodija",
      addressLocality: "Ibadan",
      addressRegion: "Oyo",
      postalCode: "000234",
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 7.3775,
      longitude: 3.8938,
    },
    sameAs: [
      "https://twitter.com/AjaniAI",
      "https://linkedin.com/company/ajaniai",
      "https://facebook.com/ajaniai",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "2",
    },
    image:
      "https://res.cloudinary.com/debpabo0a/image/upload/v1761912981/wi5ff9fjsrgvduiq1zlk.png",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(businessData)}</script>
    </Helmet>
  );
}
