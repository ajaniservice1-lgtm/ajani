// src/components/ui/AuthModal.jsx
import { useState, useEffect } from "react";
import { FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { CiLogin, CiMail, CiLock } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { auth, googleProvider } from "../../lib/firebase";
import { Link } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { motion } from "framer-motion";

export default function AuthModal({ isOpen, onClose, onAuthToast }) {
  const [activeTab, setActiveTab] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (activeTab === "signup" && !agreeToTerms) {
      setError("You must agree to the Terms & Conditions to sign up.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created!");
        onAuthToast?.("Welcome to Ajani AI!");
        setTimeout(onClose, 1000);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Signed in successfully!");
        onAuthToast?.("Welcome to Ajani AI!");
        setTimeout(onClose, 1000);
      }
    } catch (err) {
      console.error(err);
      let message = "An error occurred.";
      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (err.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess("Signed in with Google!");
      onAuthToast?.("Welcome to Ajani AI!");
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/unauthorized-domain" ||
        err.code === "auth/invalid-continue-uri"
      ) {
        setError(
          "Google Sign-In is not configured for this domain. Please use email login or contact support."
        );
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email to reset password.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when switching tabs
  useEffect(() => {
    if (!isOpen) return;
    setEmail("");
    setPassword("");
    setAgreeToTerms(false);
    setError("");
    setSuccess("");
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Determine if mobile (screen width < 768px)
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal Container */}
      <motion.div
        initial={{ y: isMobile ? "100%" : 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: isMobile ? "100%" : 0, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`bg-white rounded-2xl w-full ${
          isMobile
            ? "max-w-full fixed bottom-0 left-0 right-0 h-[60vh]"
            : "max-w-md"
        } ${isMobile ? "rounded-t-2xl" : "p-6"} shadow-xl font-rubik`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (Mobile Only) */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >
            ←
          </button>
        )}

        {/* Scrollable Content */}
        <div
          className={`overflow-y-auto ${isMobile ? "h-full pb-2" : "h-auto"}`}
        >
          {/* Tabs */}
          <div className="flex rounded-full overflow-hidden border border-blue-200 my-4">
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "signup"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Log In
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1 px-4">
            {activeTab === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-sm text-gray-500 mb-4 px-4">
            {activeTab === "signup"
              ? "Create a free account to continue on our platform."
              : "Sign in to your existing account."}
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-2 px-4 font-medium">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 text-sm mb-2 px-4 font-medium">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <CiMail className="text-xs" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={
                  activeTab === "signup"
                    ? "johndoe@gmail.com"
                    : "Enter your email"
                }
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <CiLock className="text-xs" />
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={
                  activeTab === "signup" ? "Password" : "Enter your password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="text-lg" />
                ) : (
                  <FiEye className="text-lg" />
                )}
              </button>
            </div>

            {activeTab === "signup" && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-700">
                  I agree to the{" "}
                  <Link
                    to="/privacypage"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacypage"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            {activeTab === "login" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 text-xs underline mb-2"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                "Processing..."
              ) : activeTab === "signup" ? (
                <>
                  <FiUserPlus className="text-base flex-shrink-0" />
                  <span>SignUp</span>
                </>
              ) : (
                <>
                  <CiLogin className="text-base flex-shrink-0" />
                  <span>Log In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-70"
            >
              <FaGoogle className="text-lg" />
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
