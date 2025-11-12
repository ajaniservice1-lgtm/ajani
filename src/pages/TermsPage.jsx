import Meta from "../components/Meta";
import WorkInProgressBanner from "../components/WorkInProgressBanner";
import Header from "../components/Header";

export default function TermsPage() {
  return (
    <div className="p-6">
      {/* SEO Meta Tags for Terms Page */}
      <Meta
        title="Terms & Conditions | Ajani Directory"
        description="Read the Terms & Conditions for using Ajani Directory — your trusted local business directory in Nigeria."
        url="https://ajani.ai/termspage"
        image="https://res.cloudinary.com/debpabo0a/image/upload/v1762946675/v2rtjjuba042vvg9pqja.jpg"
      />

      <Header />
      <WorkInProgressBanner />
    </div>
  );
}
