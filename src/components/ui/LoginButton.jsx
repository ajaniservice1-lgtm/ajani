import { useState, useRef, useEffect } from "react";
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiUser as FiUserProfile,
} from "react-icons/fi";
import AuthModal from "./AuthModal";
import { useAuth } from "../../hook/useAuth";
import { supabase } from "../../lib/supabase";
import { useModal } from "../../context/ModalContext";

export default function LoginButton({ onAuthToast }) {
  const { user, loading } = useAuth();
  const { openModal, closeModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ SINGLE SOURCE OF TRUTH: Sync global modal state
  useEffect(() => {
    if (isLoginOpen || isSignupOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isLoginOpen, isSignupOpen, openModal, closeModal]);

  // 🔹 Handle sign out with Supabase
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onAuthToast?.("Thanks for visiting Ajani AI!");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // 🔸 While loading user data
  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  // 🔹 If logged in — show profile dropdown
  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative rounded-full w-10 h-10 overflow-hidden border-2 border-white shadow-md hover:shadow-lg hover:ring-2 hover:ring-blue-200 transition-all duration-200"
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <FiUser className="text-white text-lg" />
            </div>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeInSlideUp">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              {user.email}
            </div>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiUserProfile className="text-base" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiSettings className="text-base" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="text-base" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 🔸 If logged out
  return (
    <>
      {/* Desktop: Two separate buttons */}
      <div className="hidden md:flex gap-1">
        <button
          onClick={() => setIsLoginOpen(true)} // ✅ Local state only
          className="px-3 py-1.5 text-sm font-medium text-[rgb(0,6,90)]  border  rounded-full  transition-colors shadow-sm"
        >
          Sign in
        </button>
        <span className="text-gray-400 self-center">|</span>
        <button
          onClick={() => setIsSignupOpen(true)} // ✅ Local state only
          className="px-3 py-1.5 text-sm font-medium text-[rgb(0,6,90)]  border rounded-full transition-colors shadow-sm"
        >
          Registration
        </button>
      </div>

      {/* Mobile: single icon */}
      <button
        onClick={() => setIsLoginOpen(true)} // ✅ Local state only
        className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-md"
        aria-label="Login"
      >
        <FiUser className="text-lg" />
      </button>

      {/* 🔹 Login Modal */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)} // ✅ Local state only
        onAuthToast={onAuthToast}
        initialTab="login"
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true); // ✅ Let useEffect handle openModal()
        }}
      />

      {/* 🔹 Signup Modal */}
      <AuthModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)} // ✅ Local state only
        onAuthToast={onAuthToast}
        initialTab="signup"
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true); // ✅ Let useEffect handle openModal()
        }}
      />
    </>
  );
}
