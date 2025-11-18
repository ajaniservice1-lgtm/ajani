import LocalBusinessSchema from "../components/LocalBusinessSchema";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Dashboard from "../components/Dashboard";
import AiTopPicks from "../components/AiTopPicks";
import FeaturedBanner from "../components/FeaturedBanner";
import Directory from "../components/Directory";
import VendorForm from "../components/VendorForm";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import Toast from "../components/Toast";
import { useState } from "react";
import Meta from "../components/Meta";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function HomePage() {
  const [toastMessage, setToastMessage] = useState("");

  // This function will be called on login OR logout
  const showAuthToast = (message) => {
    setToastMessage(message);
  };
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const closeToast = () => {
    setToastMessage("");
  };
  return (
    <section className="relative">
      <div>
        {" "}
        <Meta
          title="Ajani.ai | Home | Ajani Directory Ajani.ai | Find Hotels | Vendors | Events & Prices in Ibadan"
          description="Discover top-rated local businesses near you."
          url="https://ajani.ai/"
          image="https://ajani.ai/images/home-og.jpg"
        />
      </div>
      <LocalBusinessSchema />
      {toastMessage && <Toast message={toastMessage} onClose={closeToast} />}
      <ChatWidget />
      <Header onAuthToast={showAuthToast} />
      <Hero />
      <Dashboard />
      <AiTopPicks onAuthToast={showAuthToast} />
      <FeaturedBanner />
      <Directory />
      <VendorForm />
      <FAQ />
      <Footer />
    </section>
  );
}
