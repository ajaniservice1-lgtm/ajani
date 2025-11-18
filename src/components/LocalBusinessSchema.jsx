import { Helmet } from "react-helmet";

export default function LocalBusinessSchema() {
  const businessData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: "AjaniAI — The Ibadan Smart Guide",
    alternateName: [
      "Ajaniai",
      "Ajani",
      "Ajani the Ibadan Smart Guide",
      "Ajani Smart Directory",
    ],
    url: "https://ajani.ai",
    logo: "https://res.cloudinary.com/debpabo0a/image/upload/v1761912981/wi5ff9fjsrgvduiq1zlk.png",
    image:
      "https://res.cloudinary.com/debpabo0a/image/upload/v1761912981/wi5ff9fjsrgvduiq1zlk.png",
    description:
      "AjaniAI helps you discover trusted businesses, vendors, and prices across Ibadan — your digital guide for local services and marketplaces.",
    founder: { "@type": "Person", name: "Ladele Ajao" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "7 Oluyoro St, off Awolowo Avenue, Old Bodija",
      addressLocality: "Ibadan",
      addressRegion: "Oyo",
      postalCode: "200284",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+2348022662256",
      contactType: "Customer Service",
    },
    geo: { "@type": "GeoCoordinates", latitude: 7.3775, longitude: 3.8938 },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    sameAs: [
      "https://www.tiktok.com/@ajanismartguide?lang=en-GB",
      "https://www.linkedin.com/company/ajani-digital-smart-guide-services",
      "https://www.facebook.com/profile.php?id=61580295532814",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "2",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(businessData)}</script>
    </Helmet>
  );
}
