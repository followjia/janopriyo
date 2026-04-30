"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { useState, useEffect } from "react";

export default function LoadingSplash() {
  const words = ["Janopriyo", "Quality", "Trust", "Shop"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050914]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading, please wait...</span>
      
      <div className="relative flex flex-col items-center justify-center gap-10">
        {/* Logo with Zoom In-Out Effect */}
        <motion.div
          animate={{ 
            scale: [0.85, 1.05, 0.85],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Animated Glow Background */}
          <div className="absolute -inset-12 bg-primary/10 blur-[60px] rounded-full animate-pulse" />
          
          <Logo 
            showText={false} 
            imageClassName="size-28 md:size-36 drop-shadow-[0_0_30px_rgba(0,209,178,0.3)]" 
            className="pointer-events-none relative z-10"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-4">
            {/* Text Loop Animation */}
            <div className="h-14 overflow-hidden flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.div
                key={words[index]}
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -25, opacity: 0 }}
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="flex flex-col items-center"
                >
                <span className={`text-4xl md:text-5xl font-black tracking-tighter ${index === 0 ? 'text-primary' : 'text-white'}`}>
                    {words[index]}
                </span>
                </motion.div>
            </AnimatePresence>
            </div>

            {/* Subtitle / Loading indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-3"
            >
                <div className="w-40 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
                    Initializing...
                </span>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
