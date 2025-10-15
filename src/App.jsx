// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";

// ✅ Import TrackingWrapper
import TrackingWrapper from "./components/TrackingWrapper";

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
          </Routes>
        </TrackingWrapper>
      </BrowserRouter>
    </section>
  );
}

export default App;
