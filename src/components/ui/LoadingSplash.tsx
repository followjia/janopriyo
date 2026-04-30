"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export default function LoadingSplash() {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading, please wait...</span>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          {/* Outer Spin Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
            className="absolute -inset-4 rounded-full border-2 border-primary/20 border-t-primary"
          />
          
          {/* Logo in center */}
          <Logo 
            showText={false} 
            imageClassName="size-16 md:size-20" 
            className="pointer-events-none"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold tracking-tight text-primary font-serif"
          >
            Janopriyo
          </motion.span>
          
          <motion.div 
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.2,
                }}
                className="size-1.5 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
