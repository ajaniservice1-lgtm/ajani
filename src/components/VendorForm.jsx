// src/components/VendorForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";

const VendorForm = () => {
  // ====== FORM DATA ======
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    area: "",
    startingPrice: "",
    whatsapp: "",
    address: "",
    Latitude: "",
    Longitude: "",
    shortDescription: "",
    itemPrices: [{ itemName: "", price: "" }],
    businessImages: [],
  });

  // ====== ADDITIONAL STATES ======
  const [fullAddress, setFullAddress] = useState(""); // ✅ For auto-geocoding UX
  const [locationInput, setLocationInput] = useState("");
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [imageURLs, setImageURLs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // ====== CATEGORY MAPPING ======
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

  // ====== GOOGLE MAPS API KEY (from .env) ======
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // ====== CATEGORY HANDLERS ======
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

  // ====== GENERIC INPUT HANDLER ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ====== GEOCODING ======
  const handleGeocode = async (input = locationInput) => {
    if (!input.trim()) {
      setLocationError("Please enter an address or coordinates");
      return;
    }

    setIsGeocoding(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        const coords = { lat, lng };

        setLocationCoords(coords);
        setLocationError("");
        setLocationInput(input); // in case called from auto

        // ✅ SYNC TO FORM DATA FOR SUBMISSION
        setFormData((prev) => ({
          ...prev,
          Latitude: lat.toString(),
          Longitude: lng.toString(),
        }));

        showToast("✅ Location found!", "success");
      } else {
        const msg =
          data.error_message || data.status === "ZERO_RESULTS"
            ? "Location not found. Try a different address."
            : "Geocoding failed. Please try again.";
        setLocationError(msg);
        setFormData((prev) => ({ ...prev, Latitude: "", Longitude: "" }));
      }
    } catch (err) {
      console.error("Geocode error:", err);
      setLocationError("Failed to get location. Check internet or API key.");
      setFormData((prev) => ({ ...prev, Latitude: "", Longitude: "" }));
    } finally {
      setIsGeocoding(false);
    }
  };

  // ✅ DEBOUNCE AUTO-GEOCODING (on fullAddress change)
  useEffect(() => {
    if (fullAddress.length > 5) {
      const timer = setTimeout(() => {
        handleGeocode(fullAddress);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [fullAddress]);

  // ====== IMAGE HANDLING ======
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

  // ====== ITEM PRICES ======
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

  // ====== TOAST ======
  const showToast = (message, type) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 4000);
  };

  // ====== SUBMIT ======
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: coordinates required?
    // if (!formData.Latitude || !formData.Longitude) {
    //   showToast("❌ Please get location coordinates first.", "error");
    //   return;
    // }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `Submitting...`;
    submitBtn.disabled = true;

    try {
      // ✅ Prepare payload with 4 image slots
      const imageSlots = [
        formData.businessImages[0] || "",
        formData.businessImages[1] || "",
        formData.businessImages[2] || "",
        formData.businessImages[3] || "",
      ];

      const payload = {
        ...formData,
        businessImage1: imageSlots[0],
        businessImage2: imageSlots[1],
        businessImage3: imageSlots[2],
        businessImage4: imageSlots[3],
        // Latitude & Longitude already in formData
      };

      await fetch(
        "https://script.google.com/macros/s/AKfycbxj9ddNs21rl32KCeyfj209KZzsft2X4Tmba_irEum_SwD3HeQpD6hyOj0kLi9fwLx5/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
        }
      );

      showToast(
        "✅ Form submitted! We’ll review and add you to our catalog within 24 hours.",
        "success"
      );

      // ✅ Reset form
      setFormData({
        businessName: "",
        category: "",
        area: "",
        startingPrice: "",
        whatsapp: "",
        address: "",
        Latitude: "",
        Longitude: "",
        shortDescription: "",
        itemPrices: [{ itemName: "", price: "" }],
        businessImages: [],
      });
      setFullAddress("");
      setLocationInput("");
      setLocationCoords(null);
      setImageURLs([]);

      // Reset category selects
      setSelectedMainCategory("");
      setSelectedSubcategory("");
    } catch (error) {
      console.error("Submission failed:", error);
      showToast(
        "❌ Failed to submit. Please try again or contact us on WhatsApp.",
        "error"
      );
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  };

  // ====== ANIMATIONS ======
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

  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const inViews = refs.map((r) => useInView(r, { once: false, amount: 0.2 }));

  return (
    <section
      id="vendors"
      className="py-16 bg-gray-900 text-white relative overflow-hidden font-rubik"
    >
      {/* Toast */}
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
        {/* Header */}
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

        {/* Form */}
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
              ref={refs[0]}
              variants={fadeUp}
              animate={inViews[0] ? "visible" : "hidden"}
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
              ref={refs[1]}
              variants={fadeUp}
              animate={inViews[1] ? "visible" : "hidden"}
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

            {/* Full Address + Location */}
            <motion.div
              ref={refs[2]}
              variants={fadeUp}
              animate={inViews[2] ? "visible" : "hidden"}
            >
              {/* Full Address */}
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Full Address
              </label>
              <input
                type="text"
                placeholder="Street, area, Ibadan (auto-detects location)"
                value={fullAddress}
                onChange={(e) => {
                  const addr = e.target.value;
                  setFullAddress(addr);
                  setFormData((prev) => ({ ...prev, address: addr }));
                  setLocationInput(addr);
                }}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-gray-400 mb-4"
              />

              {/* Location Input */}
              <label className="block text-sm font-medium mb-1">
                Business Location (Latitude, Longitude)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 7.385687, 3.866762 or type address"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleGeocode()}
                  disabled={isGeocoding}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-md transition flex items-center gap-1"
                >
                  {isGeocoding ? (
                    <>
                      <span className="animate-spin h-3 w-3 rounded-full border-t-2 border-white"></span>
                      Detecting...
                    </>
                  ) : (
                    "Get Coordinates"
                  )}
                </button>
              </div>
              {locationError && (
                <p className="text-red-400 text-xs mt-1">{locationError}</p>
              )}
              {locationCoords && (
                <p className="text-green-400 text-xs mt-1 font-mono">
                  ✅ Lat: {locationCoords.lat.toFixed(6)} | Lng:{" "}
                  {locationCoords.lng.toFixed(6)}
                </p>
              )}
            </motion.div>

            {/* Short Description */}
            <motion.div
              ref={refs[3]}
              variants={fadeUp}
              animate={inViews[3] ? "visible" : "hidden"}
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
              ref={refs[4]}
              variants={fadeUp}
              animate={inViews[4] ? "visible" : "hidden"}
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
              ref={refs[5]}
              variants={fadeUp}
              animate={inViews[5] ? "visible" : "hidden"}
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
              variants={fadeUp}
              animate={inViews[5] ? "visible" : "hidden"}
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
                    <Link className="text-blue-600 underline" to="/privacypage">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <i className="fab fa-telegram-plane"></i> Submit Listing
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
