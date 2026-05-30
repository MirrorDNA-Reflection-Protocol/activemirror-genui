"use client";

import { motion } from "motion/react";

export default function HeroSection() {
  return (
    <section className="text-center px-6 pt-6 pb-2 lg:pt-12 lg:pb-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-[2rem] leading-tight sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 tracking-tight"
      >
        What will you build?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="mt-3 text-sm sm:text-base lg:text-lg text-gray-500 max-w-md mx-auto leading-relaxed"
      >
        Your journey starts here. No credit consumption
        <br className="sm:hidden" /> for exploration.
      </motion.p>
    </section>
  );
}
