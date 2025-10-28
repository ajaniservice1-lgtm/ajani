// src/components/Toast.jsx
export default function Toast({ message, onClose }) {
  console.log("💬 Toast received:", { message, type: typeof message });

  setTimeout(onClose, 3000);

  return (
    <>
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-fadeInSlideUp"
        style={{ backgroundColor: "#3b82f6", color: "white" }} // ✅ blue bg + white text
      >
        {message}
      </div>

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 toast animate-fadeInSlideUp">
        {message}
      </div>
    </>
  );
}
