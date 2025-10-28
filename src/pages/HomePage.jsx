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

export default function HomePage() {
   const [toastMessage, setToastMessage] = useState("");

   // This function will be called on login OR logout
   const showAuthToast = (message) => {
     setToastMessage(message);
   };

   const closeToast = () => {
     setToastMessage("");
   };
  return (
    <section className="relative">
      {toastMessage && <Toast message={toastMessage} onClose={closeToast} />}
      <ChatWidget />
      <Header onAuthToast={showAuthToast} />
      <Hero />
      <Dashboard />
      <AiTopPicks />
      <FeaturedBanner />
      <Directory />
      <VendorForm />
      <FAQ />
      <Footer />
    </section>
  );
}
