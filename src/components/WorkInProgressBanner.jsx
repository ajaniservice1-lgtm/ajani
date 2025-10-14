import { motion } from "framer-motion";

export default function WorkInProgressBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-3xl mx-auto mb-8 p-5 rounded-xl overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, #101828 0%, #05f2c1 25%, #3276ee 50%, #1ab9d6 100%)",
      }}
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      <div className="relative z-10 flex items-center justify-center space-x-3">
        {/* Pulsing construction emoji */}
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="text-2xl"
          aria-label="Under construction"
        >
          🚧
        </motion.span>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white font-bold text-lg md:text-xl text-center font-rubik"
        >
          Work in Progress — This page will be ready soon 🔧
        </motion.p>
      </div>
    </motion.div>
  );
}
