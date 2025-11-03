// src/App.jsx
import React, { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";

const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <TrackingWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacypage" element={<PrivacyPage />} />
            <Route path="/termspage" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </TrackingWrapper>
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;
