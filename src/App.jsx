// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";

// Lazy-load pages for performance
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

function App() {
  return (
    <>
      {/* Inject JSON-LD schema for SEO */}
      <LocalBusinessSchema />

      {/* Provide chat context globally */}
      <ChatProvider>
        <BrowserRouter>
          <TrackingWrapper>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen text-gray-600">
                  Loading...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/privacypage" element={<PrivacyPage />} />
                <Route path="/termspage" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </Suspense>
          </TrackingWrapper>
        </BrowserRouter>
      </ChatProvider>
    </>
  );
}

export default App;
