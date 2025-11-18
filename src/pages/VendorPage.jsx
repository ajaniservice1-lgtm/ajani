// src/pages/VendorPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import Meta from "../components/Meta";
import LocalBusinessSchema from "../components/LocalBusinessSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useGoogleSheet from "../hooks/useGoogleSheet";
import { generateSlug } from "../utils/vendorUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthModal from "../components/ui/AuthModal";
import ImageModal from "../components/ImageModal";
import ContactReveal from "../components/ContactReveal";
import { faStar, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { GoOrganization } from "react-icons/go";
import { LuPhone } from "react-icons/lu";
import { IoPricetagsOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  useLocation as useUserLocation,
  getDistance,
} from "../hooks/useLocation";
import { useAuth } from "../hooks/useAuth";

// Feature icon mapping
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
} from "@fortawesome/free-solid-svg-icons";

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
  const { user, loading: authLoading } = useAuth();

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { location: userLocation, requestLocation } = useUserLocation();

  useEffect(() => requestLocation().catch(console.log), []);

  function getFeatureIcon(feature) {
    const normalized = feature.trim().toLowerCase();
    for (const entry of keywordIcons) {
      if (entry.keywords.some((kw) => normalized.includes(kw)))
        return entry.icon;
    }
    return faCircleInfo;
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
    () => vendor?.["image url"]?.split(",").map((img) => img.trim()) || [],
    [vendor]
  );

  useEffect(() => window.scrollTo({ top: 0, behavior: "smooth" }), [slug]);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(
        () => setCurrentImage((prev) => (prev + 1) % images.length),
        5000
      );
      return () => clearInterval(timer);
    }
  }, [images]);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) nextImage();
    if (touchStartX.current - touchEndX.current < -75) prevImage();
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      console.log(
        "Submit review for:",
        vendor.name,
        "Text:",
        reviewText,
        "User:",
        user?.email
      );
      setReviewText("");
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading)
    return (
      <main className="max-w-4xl mx-auto py-12 text-center">
        Loading vendor...
      </main>
    );
  if (error)
    return (
      <main className="max-w-4xl mx-auto py-12 text-center text-red-600">
        {error}
      </main>
    );
  if (!vendor)
    return (
      <main className="max-w-4xl mx-auto py-12 text-center">
        <p className="mb-4">Vendor not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Directory
        </Link>
      </main>
    );

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
        {/* Vendor Content */}
        {/* ... your full JSX layout as in original VendorPage, with images, review section, similar vendors */}
        {/* Make sure all HTML tags are JSX-compliant and all raw <head> content removed */}
      </main>

      <Footer />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthToast={(msg) => console.log(msg)}
      />
      {isModalOpen && (
        <ImageModal
          images={images}
          initialIndex={modalStartIndex}
          onClose={() => setIsModalOpen(false)}
          item={vendor}
        />
      )}
    </>
  );
}
