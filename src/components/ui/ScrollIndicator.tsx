"use client";

import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 mt-8"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <span className="text-xs text-[var(--text-tertiary)] tracking-wider uppercase">
        Scroll
      </span>
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[var(--text-tertiary)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </motion.svg>
    </motion.div>
  );
}
