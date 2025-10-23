// src/App.jsx
import React, { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Import TrackingWrapper
import TrackingWrapper from "./components/TrackingWrapper";
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));

function App() {
  return (
    <section className="">
      <BrowserRouter>
        {/* ✅ Wrap Routes with TrackingWrapper */}
        <TrackingWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacypage" element={<PrivacyPage />} />
            <Route path="/termspage" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blogpage" element={<BlogPage />} />
          </Routes>
        </TrackingWrapper>
      </BrowserRouter>
    </section>
  );
}

export default App;
