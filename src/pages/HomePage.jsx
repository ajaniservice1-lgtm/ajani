import Header from "../components/Header";
import Hero from "../components/Hero";
import Dashboard from "../components/PriceInsightsDashboard";
import AiTopPicks from "../components/AiTopPicks";
import FeaturedBanner from "../components/FeaturedBanner";
import Directory from "../components/Directory";
import VendorForm from "../components/VendorForm";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";

export default function HomePage() {
  return (
    <section className="">
      <ChatWidget />
      <Header />
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
