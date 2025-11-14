import { useParams, Link, useNavigate } from "react-router-dom";
import Meta from "../components/Meta";
import LocalBusinessSchema from "../components/LocalBusinessSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useGoogleSheet from "../hook/useGoogleSheet";
import { generateSlug } from "../utils/vendorUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthModal from "../components/ui/AuthModal";
import ImageModal from "../components/ImageModal";


import {
  faMapMarkerAlt,
  faStar,
  faArrowLeft,
  faArrowRight,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { GoOrganization } from "react-icons/go";
import { LuPhone } from "react-icons/lu";
import { IoPricetagsOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import ContactReveal from "../components/ContactReveal";

import {
  faWifi,
  faSquareParking,
  faUtensils,
  faWaterLadder,
  faDumbbell,
  faChampagneGlasses,
  faSpa,
  faSnowflake,
  faTv,
  faShieldHalved,
  faShirt,
  faHeart,
  faEgg,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

const featureIcons = {
  wifi: faWifi,
  parking: faSquareParking,
  breakfast: faUtensils,
  food: faUtensils,
  restaurant: faUtensils,
  pool: faWaterLadder,
  gym: faDumbbell,
  bar: faChampagneGlasses,
  spa: faSpa,
  aircondition: faSnowflake,
  ac: faSnowflake, // synonym
  tv: faTv,
  television: faTv, // synonym
  security: faShieldHalved,
  guard: faShieldHalved, // synonym
  laundry: faShirt,
  love: faHeart,
  romance: faHeart, // synonym
  egg: faEgg,
};

const keywordIcons = [
  { keywords: ["wifi"], icon: faWifi },
  { keywords: ["parking"], icon: faSquareParking },
  {
    keywords: ["breakfast", "food", "restaurant", "meal", "buffet"],
    icon: faUtensils,
  },
  { keywords: ["pool"], icon: faWaterLadder },
  { keywords: ["gym", "fitness"], icon: faDumbbell },
  { keywords: ["bar"], icon: faChampagneGlasses },
  { keywords: ["spa"], icon: faSpa },
  { keywords: ["aircondition", "ac", "air conditioning"], icon: faSnowflake },
  { keywords: ["tv", "television"], icon: faTv },
  { keywords: ["security", "guard"], icon: faShieldHalved },
  { keywords: ["laundry", "wash"], icon: faShirt },
  { keywords: ["love", "romance", "valentine"], icon: faHeart },
  { keywords: ["egg"], icon: faEgg },
];



export default function VendorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const [currentImage, setCurrentImage] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);

  const [showAuth, setShowAuth] = useState(false);
  const openAuthModal = () => setShowAuth(true);

  function getFeatureIcon(feature) {
    const normalized = feature.trim().toLowerCase();
    for (const entry of keywordIcons) {
      if (entry.keywords.some((kw) => normalized.includes(kw))) {
        return entry.icon;
      }
    }
    return faCircleInfo; // fallback if nothing matches
  }

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet({
    sheetId: SHEET_ID,
    apiKey: API_KEY,
  });

  const vendor = useMemo(
    () => listings.find((v) => generateSlug(v.name, v.area) === slug),
    [listings, slug]
  );

  const images = useMemo(
    () =>
      vendor?.["image url"]
        ? vendor["image url"].split(",").map((img) => img.trim())
        : [],
    [vendor]
  );

  // ✅ Scroll top when switching vendors
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // ✅ Auto slide every 5s
  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images]);

  // ✅ Manual + swipe navigation
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) nextImage();
    if (touchStartX.current - touchEndX.current < -75) prevImage();
  };

  function getCategoryUrl(vendor) {
    if (!vendor?.category) return "/"; // fallback to home

    const mainCategory = vendor.category.split(".")[0].toLowerCase();

    // Map it to your directory route if needed
    // e.g. your homepage might have /hotels, /events, /restaurants
    const categoryMap = {
      hotels: "/hotels",
      event: "/events",
      restaurant: "/restaurants",
      services: "/services",
      flat: "/flats", // add other categories as needed
    };

    return categoryMap[mainCategory] || "/"; // fallback to home
  }

  const similar = useMemo(() => {
    if (!vendor) return [];

    const vendorCategoryBase = vendor.category?.split(".")[0]?.toLowerCase();

    const filtered = listings.filter((v) => {
      const sameArea = v.area?.toLowerCase() === vendor.area?.toLowerCase();
      const sameCategory = v.category
        ? v.category.split(".")[0].toLowerCase() === vendorCategoryBase
        : false;
      const notSelf = v.name !== vendor.name;
      return sameArea && sameCategory && notSelf;
    });

    // Sort: first by rating descending, then by price_from ascending
    const sorted = filtered.sort((a, b) => {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;

      if (ratingB !== ratingA) return ratingB - ratingA;

      const priceA = parseInt(a.price_from?.replace(/\D/g, "")) || Infinity;
      const priceB = parseInt(b.price_from?.replace(/\D/g, "")) || Infinity;

      return priceA - priceB;
    });

    return sorted;
  }, [listings, vendor]);

  if (loading)
    return (
      <main className="max-w-4xl mx-auto py-12 px-4 text-center ">
        <p>Loading vendor...</p>
      </main>
    );

  if (error)
    return (
      <main className="max-w-4xl mx-auto  py-12 px-4 text-center">
        <p className="text-red-600">{error}</p>
      </main>
    );

  if (!vendor)
    return (
      <main className="max-w-4xl mx-auto py-12 px-4 text-center ">
        <p className="text-gray-700 mb-4">Vendor not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Directory
        </Link>
      </main>
    );

  function formatCategory(category) {
    if (!category) return "";

    // Split by dot if exists (like "event.weekend")
    const parts = category.split(".");

    // Capitalize each word
    const capitalized = parts.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );

    return capitalized.join(" "); // "Event Weekend"
  }

  function getSimilarTitle(vendor) {
    if (!vendor) return "Similar Vendors";

    const { category, area } = vendor;

    if (!category) return `Similar Vendors in ${area}`;

    // Split category by dot if exists
    const parts = category.split(".");

    if (category.toLowerCase() === "hotels") {
      return `Similar Hotels in ${area}`;
    } else if (parts[0].toLowerCase() === "event") {
      // e.g. "event.weekend" -> "Similar Weekend Events in Bodija"
      const eventName = parts[1]
        ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
        : "";
      return `Similar ${eventName} Events in ${area}`;
    } else {
      // default fallback
      const formattedCategory = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
      return `Similar ${formattedCategory} in ${area}`;
    }
  }

  return (
    <>
      <Meta
        title={`${vendor.name} | Ajani Directory`}
        description={`Find ${vendor.name} at ${vendor.area}. Contact: ${vendor.whatsapp}`}
        url={`https://ajani.ai/vendor/${slug}`}
        image={images[0] || ""}
      />
      <LocalBusinessSchema vendor={vendor} />
      <Header />

      <main className="max-w-5xl mx-auto py-10 px-4 font-rubik text-sm">
        {/* --- Vendor Section --- */}
        <section className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
          {/* --- Main Content Layout: Flex for large screens, Stack for mobile --- */}
          <div className="md:flex md:flex-row md:items-start gap-6">
            {/* --- Left Column: Details & Info Box (Large Screen) / Stacked (Mobile) --- */}
            <div className="flex-1 space-y-6">
              {/* --- Vendor Name & Rating --- */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="text-3xl font-bold">{vendor.name}</h1>
                  <div className="flex items-center text-yellow-500 font-semibold text-sm mt-1">
                    <FontAwesomeIcon icon={faStar} className="ml-2 mr-1" />
                    {vendor.rating || "5.0"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {vendor.features &&
                    vendor.features.split(",").map((feature, i) => {
                      const icon = getFeatureIcon(feature);
                      return (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-sm bg-blue-50 text-blue-800 px-2 py-1 rounded-full break-words"
                        >
                          <FontAwesomeIcon
                            icon={icon}
                            className="text-blue-600"
                          />
                          {feature.trim()}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* --- Info Box --- */}
              <div className="space-y-3">
                <p className="flex items-center">
                  <CiLocationOn className="mr-2 text-gray-900" />
                  <strong className="mr-2">Area:</strong> {vendor.area}
                </p>

                <div className="flex items-center">
                  <LuPhone className="mr-1 text-gray-900" />

                  <ContactReveal
                    label="Phone"
                    value={vendor.whatsapp}
                    formattedValue={vendor.whatsapp}
                    onAuthOpen={() => setShowAuth(true)}
                  />
                </div>
                <AuthModal
                  isOpen={showAuth}
                  onClose={() => setShowAuth(false)}
                  onAuthToast={(msg) => console.log(msg)}
                />

                <p className="flex items-center">
                  <GoOrganization className="mr-2 text-gray-900" />
                  <strong className="mr-1">Category:</strong> {vendor.category}
                </p>

                <p className="flex items-center">
                  <IoPricetagsOutline className="mr-2 text-gray-900" />
                  <strong className="mr-1">From:</strong> ₦{vendor.price_from}
                </p>
              </div>

              {/* --- Ratings Breakdown --- */}
              <div>
                <h2 className="text-xl font-bold mb-3">Ratings Breakdown</h2>
                <div className="space-y-3">
                  {vendor.ratings_breakdown ? (
                    vendor.ratings_breakdown.split(",").map((pair, i) => {
                      const [label, value] = pair
                        .split(":")
                        .map((s) => s.trim());
                      const numericValue = parseFloat(value) || 0;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium w-1/3">{label}</span>
                          <div className="flex-1 mx-2">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[rgb(0,6,90)] h-2 rounded-full"
                                style={{
                                  width: `${Math.min(numericValue * 20, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="font-semibold w-1/6 text-right">
                            {numericValue.toFixed(1)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">
                      No detailed ratings available
                    </p>
                  )}
                </div>
              </div>

              {/* --- Write a Review Button --- */}
              <button className="w-full bg-gray-100 hover:bg-gray-200 my-2 text-gray-800 font-semibold py-3 px-4 rounded-lg transition">
                <FontAwesomeIcon icon={faStar} className="mr-2 " />
                Write a Review (Login Required)
              </button>
            </div>

            {/* --- Right Column: Image Slider (Large Screen) / Below Info Box (Mobile) --- */}
            {/* --- Right Column: Image Slider / Modal Trigger --- */}
            <div className="md:w-1/2">
              <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden">
                {images.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImage}
                      src={images[currentImage]}
                      alt={`${vendor.name} image ${currentImage + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      onClick={() => {
                        setModalStartIndex(currentImage);
                        setIsModalOpen(true);
                      }}
                    />
                  </AnimatePresence>
                )}

                {/* Optional: Image Counter Overlay */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                    {currentImage + 1}/{images.length}
                  </div>
                )}
              </div>

              {/* ✅ Description below the slider */}
              {vendor.short_desc && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    {vendor.short_desc}
                  </p>
                </div>
              )}
            </div>

            {/* --- Image Modal --- */}
            {isModalOpen && (
              <ImageModal
                images={images}
                initialIndex={modalStartIndex}
                onClose={() => setIsModalOpen(false)}
                item={vendor} // pass full vendor object for WhatsApp, name, etc.
                onAuthToast={(msg) => console.log(msg)}
                onOpenChat={() => console.log("Open global ChatWidget")}
              />
            )}
          </div>
        </section>

        {similar.length > 0 && (
          <section className="bg-white rounded-2xl shadow-md p-6 mt-10 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">
              {getSimilarTitle(vendor)}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {similar.map((item, i) => (
                <div
                  key={i}
                  onClick={() =>
                    navigate(`/vendor/${generateSlug(item.name, item.area)}`)
                  }
                  className="flex-none w-52 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition p-2 border border-gray-100 cursor-pointer"
                >
                  <img
                    src={item["image url"]?.split(",")[0]}
                    alt={item.name}
                    className="w-full h-28 object-cover rounded-lg"
                  />
                  <p className="font-semibold mt-2 truncate">{item.name}</p>
                  <p className="text-yellow-500 text-sm">
                    ⭐ {item.rating || "N/A"} • ₦{item.price_from || "—"}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="mt-4 text-center">
                <Link
                  to="/"
                  onClick={(e) => {
                    e.preventDefault(); // prevent default link navigation
                    navigate("/"); // go to homepage

                    setTimeout(() => {
                      const directorySection =
                        document.getElementById("directory");
                      if (directorySection) {
                        directorySection.scrollIntoView({
                          behavior: "smooth",
                          block: "start", // push it to top of viewport
                        });
                      }
                    }, 100); // slightly longer delay to ensure DOM is rendered
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Show More {vendor.category ? `in ${vendor.area}` : ""}{" "}
                  (directory) →
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      {isModalOpen && (
        <ImageModal
          images={images}
          initialIndex={modalStartIndex}
          onClose={() => setIsModalOpen(false)}
          contact={{ label: "Seller", value: vendor.whatsapp }}
          onAuthToast={(msg) => console.log(msg)}
          onOpenChat={() => console.log("Open chat")} // replace with your ChatWidget trigger
        />
      )}
    </>
  );
}
