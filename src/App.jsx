import React from "react";

import { BrowserRouter, Routes, Route } from "react-router";

import HomePage from "./pages/HomePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <section className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacypage" element={<PrivacyPage />} />
          <Route path="/termspage" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </BrowserRouter>
    </section>
  );
}

export default App;
