import Header from "../components/Header";
import Footer from "../components/Footer";
import React, { useState, useEffect } from "react"; // ✅ Added useEffect

const ContactPage = () => {
  // ✅ Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "Sending...";
    submitBtn.disabled = true;

    try {
      // 🔴 REPLACE WITH YOUR GOOGLE APPS SCRIPT URL
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxD2JQmZoAyVeDwEp9rluQFm5YPig-r3IQUzRDjmidhvWf_3Tm8nxYOCocIfrhTMZGxng/exec",
        {
          method: "POST",
          mode: "no-cors", // Required for Google Apps Script
          headers: {
            "Content-Type": "text/plain", // Must be text/plain for no-cors
          },
          body: JSON.stringify(formData),
        }
      );

      // Because of no-cors, we can't read response — but if no error, assume success
      alert("✅ Message sent! We’ll get back to you within 24–48 hours.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        message: "",
      });
    } catch (error) {
      console.error("Submission failed:", error);
      alert("❌ Failed to send. Please try again or contact us on WhatsApp.");
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-rubik">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#101828]">
              Contact Us
            </h1>
            <p className="mt-3 text-lg text-gray-500 max-w-3xl mx-auto">
              We would love to hear from you! Whether you have questions,
              feedback, or just want to say hello, feel free to reach out.
            </p>
          </div>

          {/* Form + Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Enter your country"
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={6}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Contact Info
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    <a
                      href="tel:+2348022662256"
                      className="text-blue-600 hover:underline"
                    >
                      +2348022662256
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    <span className="text-blue-600">
                      7, Oluyoro Street, off Awolowo Avenue, Old Bodija, Ibadan
                    </span>
                  </p>
                  <p className="text-blue-600 font-medium mt-4">
                    We’ll get back to you within 24–48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
