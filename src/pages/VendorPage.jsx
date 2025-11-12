// src/pages/VendorPage.jsx
import { useParams, Link } from "react-router-dom";
import Meta from "../components/Meta";
import LocalBusinessSchema from "../components/LocalBusinessSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useGoogleSheet from "../hook/useGoogleSheet"; // reuse your hook
import { generateSlug } from "../utils/vendorUtils";

export default function VendorPage() {
  const { slug } = useParams();
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  if (loading)
    return (
      <main className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p>Loading vendor...</p>
      </main>
    );

  if (error)
    return (
      <main className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600">{error}</p>
      </main>
    );

  // Find vendor by matching slug
  const vendor = listings.find((v) => generateSlug(v.name, v.area) === slug);

  if (!vendor)
    return (
      <main className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-700 mb-4">Vendor not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Directory
        </Link>
      </main>
    );

  const images = vendor["image url"]?.split(",").map((img) => img.trim()) || [];

  return (
    <>
      {/* SEO Meta & JSON-LD */}
      <Meta
        title={`${vendor.name} | Ajani Directory`}
        description={`Find ${vendor.name} at ${vendor.area}. Contact: ${vendor.whatsapp}`}
        url={`https://ajani.ai/vendor/${slug}`}
        image={images[0] || ""}
      />
      <LocalBusinessSchema vendor={vendor} />

      <Header />

      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-4">{vendor.name}</h1>
        <p className="text-gray-700 mb-2">{vendor.short_desc}</p>

        <div className="mb-4">
          <p>
            <strong>Area:</strong> {vendor.area}
          </p>
          <p>
            <strong>Phone:</strong> {vendor.whatsapp}
          </p>
          <p>
            <strong>Category:</strong> {vendor.category}
          </p>
          <p>
            <strong>Tags:</strong> {vendor.tags}
          </p>
          <p>
            <strong>Price From:</strong> ₦ {vendor.price_from}
          </p>
          <p>
            <strong>Rating:</strong> ⭐ {vendor.rating || "N/A"}
          </p>
        </div>

        {/* Vendor Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${vendor.name} image ${i + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-sm"
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
