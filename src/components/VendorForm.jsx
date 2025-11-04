// src/components/VendorForm.jsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";

const VendorForm = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    area: "",
    startingPrice: "",
    whatsapp: "",
    address: "",
    shortDescription: "",
    itemPrices: [{ itemName: "", price: "" }],
    businessImages: [],
  });

  const [imageURLs, setImageURLs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryMap = {
    accommodation: ["hotel", "guesthouse", "airbnb", "shortlet", "resort"],
    food: ["restaurant", "cafe", "bar", "streetfood", "amala"],
    event: ["weekend", "concert", "art", "tech", "nightlife"],
    shopping: ["mall", "market", "boutique"],
    transport: ["ridehail", "carrental", "bus", "dispatch"],
    attraction: ["garden", "hall", "tower", "park"],
    health: ["hospital", "pharmacy", "gym", "spa"],
    edu: ["university", "library", "cowork"],
    service: ["plumber", "laundry", "beauty", "photographer"],
    biz: ["bank", "fx", "hub"],
    promo: ["deal"],
    jobs: ["gig"],
    realestate: ["rental"],
    gov: ["service"],
  };

  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const handleCategoryChange = () => {
    if (selectedMainCategory && selectedSubcategory) {
      setFormData((prev) => ({
        ...prev,
        category: `${selectedMainCategory}.${selectedSubcategory}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleMainCategoryChange = (e) => {
    const mainCat = e.target.value;
    setSelectedMainCategory(mainCat);
    setSelectedSubcategory("");
    setFormData((prev) => ({ ...prev, category: "" }));
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (imageURLs.length + files.length > 4) {
      showToast("❌ You can upload up to 4 images only.", "error");
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = ["image/png", "image/jpeg"];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        showToast("❌ Only PNG and JPG files are allowed.", "error");
        return false;
      }
      if (file.size > maxSize) {
        showToast("❌ File size must be less than 5MB.", "error");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = validFiles.map((file) => {
        const formDataCloud = new FormData();
        formDataCloud.append("file", file);
        formDataCloud.append("upload_preset", "ajani-upload");
        formDataCloud.append("cloud_name", "debpabo0a");

        return fetch("https://api.cloudinary.com/v1_1/debpabo0a/image/upload", {
          method: "POST",
          body: formDataCloud,
        }).then((res) => res.json());
      });

      const results = await Promise.all(uploadPromises);
      const newURLs = results
        .filter((data) => data.secure_url)
        .map((data) => data.secure_url);

      if (newURLs.length > 0) {
        setImageURLs((prev) => [...prev, ...newURLs]);
        setFormData((prev) => ({
          ...prev,
          businessImages: [...prev.businessImages, ...newURLs],
        }));
        showToast(`✅ ${newURLs.length} image(s) uploaded!`, "success");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      showToast(`❌ Upload failed: ${error.message}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImageURLs((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      businessImages: prev.businessImages.filter((_, i) => i !== index),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      itemPrices: [...prev.itemPrices, { itemName: "", price: "" }],
    }));
  };

  const handleRemoveItemPrice = (index) => {
    setFormData((prev) => {
      const newItems = [...prev.itemPrices];
      newItems.splice(index, 1);
      return { ...prev, itemPrices: newItems };
    });
  };

  const handleItemPriceChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.itemPrices];
      newItems[index][field] = value;
      return { ...prev, itemPrices: newItems };
    });
  };

  const showToast = (message, type) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ Use correct URL with NO trailing spaces
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbycNREFmbgzOzZThDwz2ZX8wGXLOWm9WkaHlPSkX55bwiIFBkj01qTVWTWV677eQNnq/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // ✅ JSON
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      if (result.result !== "success") throw new Error("Submission failed");

      showToast(
        "✅ Form submitted! We’ll review and add you to our catalog within 24 hours.",
        "success"
      );

      // Reset form
      setFormData({
        businessName: "",
        category: "",
        area: "",
        startingPrice: "",
        whatsapp: "",
        address: "",
        shortDescription: "",
        itemPrices: [{ itemName: "", price: "" }],
        businessImages: [],
      });
      setImageURLs([]);
    } catch (error) {
      console.error("Submission failed:", error);
      showToast(
        "❌ Failed to submit. Please try again or contact us on WhatsApp.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: false, amount: 0.2 });

  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: false, amount: 0.2 });

  const addressRef = useRef(null);
  const addressInView = useInView(addressRef, { once: false, amount: 0.2 });

  const descriptionRef = useRef(null);
  const descriptionInView = useInView(descriptionRef, {
    once: false,
    amount: 0.2,
  });

  const imageRef = useRef(null);
  const imageInView = useInView(imageRef, { once: false, amount: 0.2 });

  const itemPricesRef = useRef(null);
  const itemPricesInView = useInView(itemPricesRef, {
    once: false,
    amount: 0.2,
  });

  const submitRef = useRef(null);
  const submitInView = useInView(submitRef, { once: false, amount: 0.2 });

  return (
    <section
      id="vendors"
      className="py-16 bg-gray-900 text-white relative overflow-hidden"
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium max-w-md ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={stagger}
          className="text-center mb-8"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold mb-2">
            List your business on Ajani
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300">
            Reach thousands of potential customers in Ibadan
          </motion.p>
        </motion.div>

        <motion.div
          ref={formRef}
          initial="hidden"
          animate={formInView ? "visible" : "hidden"}
          variants={stagger}
          className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
        >
          <motion.p variants={fadeUp} className="text-sm text-gray-400 mb-6">
            Fill this form — we’ll review and add you to our catalog within 24
            hours.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name + Category */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Business/Place Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g., Amala Skye"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Category
                </label>
                <select
                  value={selectedMainCategory}
                  onChange={handleMainCategoryChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white mb-2"
                  required
                >
                  <option value="">Select main category</option>
                  {Object.keys(categoryMap).map((mainCat) => (
                    <option key={mainCat} value={mainCat}>
                      {mainCat.charAt(0).toUpperCase() + mainCat.slice(1)}
                    </option>
                  ))}
                </select>

                {selectedMainCategory && (
                  <select
                    value={selectedSubcategory}
                    onChange={handleSubcategoryChange}
                    onBlur={handleCategoryChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                    required
                  >
                    <option value="">Select subcategory</option>
                    {categoryMap[selectedMainCategory].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </motion.div>

            {/* Area / Starting Price / WhatsApp */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., Bodija"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Starting Price
                </label>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  placeholder="1500"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+23480..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                  required
                />
              </div>
            </motion.div>

            {/* Full Address */}
            <motion.div
              ref={addressRef}
              variants={fadeUp}
              animate={addressInView ? "visible" : "hidden"}
            >
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Full Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, area, Ibadan"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                required
              />
            </motion.div>

            {/* Short Description */}
            <motion.div
              ref={descriptionRef}
              variants={fadeUp}
              animate={descriptionInView ? "visible" : "hidden"}
            >
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="What makes your business great?"
                rows={3}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                required
              />
            </motion.div>

            {/* Business Images (up to 4) */}
            <motion.div
              ref={imageRef}
              variants={fadeUp}
              animate={imageInView ? "visible" : "hidden"}
            >
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Upload Photos (up to 4)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imageURLs.map((url, index) => (
                  <div key={index} className="relative w-full h-32">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs z-10"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imageURLs.length < 4 && (
                  <div
                    className="border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
                    onClick={() =>
                      document.getElementById("businessImageInput").click()
                    }
                    style={{ height: "80px" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="businessImageInput"
                disabled={imageURLs.length >= 4}
              />
              {isUploading && (
                <p className="mt-2 text-xs text-blue-400">
                  Uploading images...
                </p>
              )}
            </motion.div>

            {/* Item Prices */}
            <motion.div
              ref={itemPricesRef}
              variants={fadeUp}
              animate={itemPricesInView ? "visible" : "hidden"}
            >
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Item Prices (e.g., Amala 1200, Ewedu 500, Rice 4000)
                </label>
                <div className="space-y-3">
                  {formData.itemPrices.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center"
                    >
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.itemName}
                        onChange={(e) =>
                          handleItemPriceChange(
                            index,
                            "itemName",
                            e.target.value
                          )
                        }
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                      />
                      <div className="flex space-x-3">
                        <input
                          type="number"
                          placeholder="Price (₦)"
                          value={item.price}
                          onChange={(e) =>
                            handleItemPriceChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItemPrice(index)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center w-10"
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                    >
                      ➕ Add another item
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              ref={submitRef}
              variants={fadeUp}
              animate={submitInView ? "visible" : "hidden"}
            >
              <div className="pt-2">
                <div className="flex gap-2.5 mb-2">
                  <input type="checkbox" required />
                  <label
                    htmlFor="checkbox"
                    className="text-sm font-medium text-gray-200 leading-[1.2]"
                  >
                    Click here for promotional and discount messages.
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-gray-200 my-1"
                  >
                    I agree to the{" "}
                    <Link className="text-blue-600 underline" to="/privacypage">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link className="text-blue-600 underline" to="/termspage">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex items-center gap-2 my-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-telegram-plane"></i> Submit Listing
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-400">
                  We review all listings. By submitting, you agree your info can
                  be shown publicly on Ajani.
                </p>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default VendorForm;
