// src/components/SignupModal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FiUserPlus, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { CiMail, CiLock } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function SignupModal({
  isOpen,
  onClose,
  onAuthToast,
  onOpenLogin,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!agreeToTerms) {
        setError("You must agree to Terms & Conditions.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        if (error.status === 429) {
          setError("Too many emails sent. Please wait a few minutes.");
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess("Check your email to confirm your account.");
      onAuthToast?.("Signup successful!");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) setError("Google sign-in failed. " + error.message);
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setAgreeToTerms(false);
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-sm md:max-w-md p-6 shadow-lg font-rubik relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX className="text-lg" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Create your account
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Register to access contact details and save favorites.
          </p>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-900 mb-1 flex items-center gap-1">
                <CiMail className="text-xs" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] text-sm"
                placeholder="johndoe@gmail.com"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs text-gray-900 mb-1 flex items-center gap-1">
                <CiLock className="text-xs" /> Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FiEyeOff className="text-lg" />
                ) : (
                  <FiEye className="text-lg" />
                )}
              </button>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-[rgb(0,6,90)]"
              />
              <label htmlFor="terms" className="text-xs text-gray-900">
                I agree to the{" "}
                <Link className="text-blue-600 underline" to="/privacy">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link className="text-blue-600 underline" to="/privacy">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[rgb(0,6,90)] text-white py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[#0e1f45] disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>
                  <FiUserPlus className="text-base" /> Sign Up
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              <FaGoogle className="text-lg text-red-500" />
              Continue with Google
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
