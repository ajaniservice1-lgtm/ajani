// src/components/ui/LoginButton.jsx
import { useState } from "react";
import { FiUser } from "react-icons/fi";
import AuthModal from "./AuthModal";

export default function LoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-[rgb(0,6,90)] hover:bg-[rgb(15,19,71)] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        aria-label="Login"
      >
        <FiUser className="text-base" />
        <span>Login</span>
      </button>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
