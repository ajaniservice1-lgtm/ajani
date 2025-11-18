import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { FiUserPlus, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { CiLogin, CiMail, CiLock } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useModal } from "../../context/ModalContext";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthToast,
  initialTab = "login",
  onSwitchToSignup,
  onSwitchToLogin,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

   const { openModal, closeModal } = useModal();

   useEffect(() => {
     if (isOpen) {
       openModal(); // ✅ Notify global state
     } else {
       closeModal(); // ✅ Notify global state
     }
   }, [isOpen, openModal, closeModal]);



  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setUnconfirmedEmail("");

    try {
      if (activeTab === "signup") {
        if (!agreeToTerms) {
          setError("You must agree to Terms & Conditions.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.status === 429) {
            setError(
              "Too many emails sent. Please wait a few minutes before trying again."
            );
          } else {
            setError(error.message);
          }
          return;
        }

        setSuccess("Check your email to confirm your account.");
        onAuthToast?.("Signup successful!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setError(
              "Your email is not confirmed yet. Please check your inbox and click the verification link."
            );
            setUnconfirmedEmail(email);
          } else if (
            error.status === 429 ||
            error.message.includes("rate limit")
          ) {
            setError("Too many login attempts. Please try again later.");
          } else {
            setError(error.message);
          }
          return;
        }

        setSuccess("Logged in successfully!");
        onAuthToast?.("Welcome back!");
        setTimeout(onClose, 800);
      }
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

  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      if (error.status === 429) {
        setError("Too many password reset requests. Please try again later.");
      } else {
        setError(error.message);
      }
    } else {
      setSuccess("Password reset email sent!");
    }
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail || resendCooldown > 0) return;

    try {
      const { error } = await supabase.auth.signUp({
        email: unconfirmedEmail,
        password: "dummy-password",
      });

      if (error && !error.message.includes("User already registered")) {
        if (error.status === 429) {
          setError(
            "Too many confirmation emails sent. Please wait a few minutes."
          );
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess("Confirmation email resent! Check your inbox.");
      setResendCooldown(60);
      setUnconfirmedEmail("");
    } catch (err) {
      setError(err.message || "Failed to resend confirmation email.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // Reset to *initial* tab when reopened
    setActiveTab(initialTab || "login");
    setEmail("");
    setPassword("");
    setAgreeToTerms(false);
    setError("");
    setSuccess("");
    setUnconfirmedEmail("");
    setResendCooldown(0);
  }, [isOpen, initialTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-sm md:max-w-md p-6 shadow-lg font-rubik mx-auto md:my-0 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              aria-label="Close modal"
            >
              <FiX className="text-lg" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl font-poppins text-gray-900">
                {activeTab === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1 font-normal font-poppins">
                {activeTab === "login"
                  ? "Sign in to your existing account."
                  : "Create a free account to continue on our platform."}
              </p>
            </div>

            {/* Messages */}
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-2">{success}</p>
            )}

            {/* Resend confirmation */}
            {unconfirmedEmail && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendCooldown > 0}
                className="text-blue-600 text-xs underline mb-2 disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend confirmation email"}
              </button>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-900 text-xs mb-1 items-center gap-1">
                  <CiMail className="text-xs" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="johndoe@gmail.com"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-xs text-gray-900 mb-1 items-center gap-1">
                  <CiLock className="text-xs" />
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 mt-7 right-3 flex items-center text-gray-500 hover:text-gray-700"
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
                  <label htmlFor="terms" className="text-xs text-gray-900">
                    I agree to the{" "}
                    <Link className="text-blue-600 underline" to="/privacypage">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link className="text-blue-600 underline" to="/privacypage">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              {activeTab === "login" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 text-xs underline mb-2"
                >
                  Forgot password?
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[rgb(0,6,90)] text-white py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[#0e1f45] disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
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
                    Processing...
                  </span>
                ) : activeTab === "signup" ? (
                  <>
                    <FiUserPlus className="text-base" /> Sign Up
                  </>
                ) : (
                  <>
                    <CiLogin className="text-base" /> Log In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-[rgb(0,6,90)] text-white py-2.5 rounded-lg text-sm hover:bg-[#0e1f45]"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-4 text-center text-sm">
              {activeTab === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={onSwitchToSignup}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Registration
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
