import Header from "../components/Header";
import Hero from "../components/Hero";
import PriceInsightsDashboard from "../components/PriceInsightsDashboard";
import AiTopPicks from "../components/AiTopPicks";
// import SponsoredBanner from "../../components/SponsoredBanner";
import FeaturedBanner from "../components/FeaturedBanner";
import Directory from "../components/Directory";
import VendorForm from "../components/VendorForm";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <section className="">
      <Header />
      <Hero />
      <PriceInsightsDashboard />
      <AiTopPicks />
      {/* <SponsoredBanner /> */}
      <FeaturedBanner />
      <Directory />
      <VendorForm />
      <FAQ />
      <Footer />
    </section>
  );
}
