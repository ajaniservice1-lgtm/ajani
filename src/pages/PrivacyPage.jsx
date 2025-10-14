import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PrivacyPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-rubik">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#101828] text-white p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-blue-100">Effective Date: October 2025</p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 prose prose-blue max-w-none">
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed text-balance">
                <strong>Ajani</strong> (“we,” “our,” or “us”) is a smart digital
                assistant <strong>(BN:8846874)</strong> that helps users
                discover services, businesses, and information. We are committed
                to safeguarding the privacy of all users in compliance with the{" "}
                <strong>Nigeria Data Protection Regulation (NDPR 2019)</strong>{" "}
                and other applicable data protection laws.
              </p>
              <p className="text-gray-700 mt-3 leading-relaxed">
                This Privacy Policy explains how Ajani collects, uses, stores,
                and shares your personal information, and outlines your rights
                as a data subject under NDPR.
              </p>
            </div>

            {/* Sections */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mt-8">
                1. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Personal Information:</strong> Name, phone number,
                  email, business details (if you list a service), and contact
                  preferences.
                </li>
                <li>
                  <strong>Interaction Data:</strong> Chats, queries, and
                  searches with Ajani.
                </li>
                <li>
                  <strong>Device Data:</strong> IP address, browser type,
                  operating system, and device identifiers.
                </li>
                <li>
                  <strong>Location Data:</strong> If you grant permission, Ajani
                  may access your location to recommend nearby services.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                2. Lawful Basis for Processing (NDPR)
              </h2>
              <p className="text-gray-700">
                We process personal data only when there is a lawful basis,
                which may include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Consent:</strong> When you give Ajani permission to
                  collect and use your data (e.g., location tracking).
                </li>
                <li>
                  <strong>Contractual Necessity:</strong> When data is required
                  to provide you with Ajani services.
                </li>
                <li>
                  <strong>Legal Obligation:</strong> When processing is required
                  by law.
                </li>
                <li>
                  <strong>Legitimate Interest:</strong> For improving Ajani,
                  preventing fraud, or ensuring system security.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700">Ajani uses your data to:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Provide personalized search results and service
                  recommendations.
                </li>
                <li>
                  Enable business owners to list and manage their services.
                </li>
                <li>Improve the accuracy and efficiency of Ajani responses.</li>
                <li>
                  Communicate updates, promotions, and important service
                  notices.
                </li>
                <li>Comply with legal and regulatory requirements.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                4. Sharing of Information
              </h2>
              <p className="text-gray-700">
                Ajani does not sell personal information. However, data may be
                shared in these cases:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>With businesses when you request to contact them.</li>
                <li>
                  With service providers (e.g., hosting, analytics, messaging
                  platforms).
                </li>
                <li>
                  With regulators, law enforcement, or authorities where legally
                  required.
                </li>
                <li>
                  With affiliates in the event of a merger, acquisition, or
                  restructuring.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                5. Cross-Border Data Transfers
              </h2>
              <p className="text-gray-700">
                If Ajani transfers your data outside Nigeria, such transfers
                will only be made to countries that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  The Nigerian Data Protection Commission (NDPC) has recognized
                  as providing adequate protection, or
                </li>
                <li>With your explicit consent, or</li>
                <li>
                  Under legally binding agreements that ensure your data is
                  protected.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                6. Data Retention
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  We retain personal information only for as long as necessary
                  to fulfill the purposes outlined in this policy.
                </li>
                <li>
                  Interaction data may be anonymized for research and
                  performance improvement.
                </li>
                <li>You can request deletion of your data at any time.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                7. Security of Data
              </h2>
              <p className="text-gray-700">
                We adopt organizational, technical, and physical safeguards to
                protect your data against loss, misuse, unauthorized access,
                disclosure, or destruction. In line with NDPR, Ajani will notify
                the NDPC and affected individuals within 72 hours in the event
                of a significant data breach.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                8. Your Rights Under NDPR
              </h2>
              <p className="text-gray-700">
                As a data subject in Nigeria, you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Access:</strong> Request copies of the personal data
                  Ajani holds about you.
                </li>
                <li>
                  <strong>Rectification:</strong> Correct incomplete or
                  inaccurate data.
                </li>
                <li>
                  <strong>Erasure (“Right to be Forgotten”):</strong> Request
                  deletion of your personal data.
                </li>
                <li>
                  <strong>Data Portability:</strong> Request your data in a
                  structured, machine-readable format.
                </li>
                <li>
                  <strong>Consent Withdrawal:</strong> Withdraw your consent at
                  any time.
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain types of
                  processing, including direct marketing.
                </li>
              </ul>
              <p className="text-gray-700 mt-3">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:ajaniservice1@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  ajaniservice1@gmail.com
                </a>
                .
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                9. Children’s Privacy
              </h2>
              <p className="text-gray-700">
                Ajani does not knowingly collect personal information from
                children under 13 years old. If such data is collected
                inadvertently, it will be deleted immediately.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                10. Changes to this Privacy Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time in
                compliance with NDPR and other applicable laws. Updates will be
                posted with a new effective date.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                11. Contact Us
              </h2>
              <p className="text-gray-700">
                For questions, complaints, or to exercise your NDPR rights,
                please contact:
              </p>
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-gray-900">
                  Ajani Data Protection Officer (DPO)
                </p>
                <p className="text-gray-700">
                  Email:{" "}
                  <a
                    href="mailto:ajaniservice1@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    ajaniservice1@gmail.com
                  </a>
                </p>
                <p className="text-gray-700">
                  Phone:{" "}
                  <a
                    href="tel:+2347077750648"
                    className="text-blue-600 hover:underline"
                  >
                    07077750648
                  </a>
                </p>
                <p className="text-gray-700">
                  Address: 7, Oluyoro Street, Bodija, Ibadan, Nigeria
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                If you are not satisfied with our response, you have the right
                to lodge a complaint directly with the{" "}
                <strong>Nigeria Data Protection Commission (NDPC)</strong>.
              </p>
            </section>
          </div>

          {/* Footer Note */}
          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Ajani. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPage;
