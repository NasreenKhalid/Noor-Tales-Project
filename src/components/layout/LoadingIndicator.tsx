import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingIndicator() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-75 z-50">
      <div className="text-center">
        <motion.div
          className="w-36 h-36 mx-auto" // Made it slightly larger
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          {/* Islamic Lantern (Fanous) SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="lanternGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFCB52" stopOpacity="0.9" /> {/* Brighter gold color */}
                <stop offset="100%" stopColor="#F4AF33" stopOpacity="0.6" /> {/* More opacity */}
              </linearGradient>
            </defs>
            
            {/* Lantern cap */}
            <path d="M256 50 L280 80 L232 80 Z" fill="rgb(25, 77, 85)" />
            
            {/* Lantern chain */}
            <path d="M256 0 L256 50" stroke="rgb(25, 77, 85)" strokeWidth="4" strokeLinecap="round" />
            
            {/* Lantern body */}
            <path d="M232 80 L200 240 L312 240 L280 80 Z" fill="rgb(25, 77, 85)" />
            
            {/* Lantern light - brighter glow */}
            <motion.path
              d="M240 100 L225 220 L287 220 L272 100 Z"
              fill="url(#lanternGlow)"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
            
            {/* Lantern patterns - brighter gold */}
            <path d="M232 120 L280 120 M225 160 L287 160 M220 200 L292 200" 
                  stroke="#FFCB52" strokeWidth="3" /> {/* Wider and brighter lines */}
            
            {/* Lantern base */}
            <path d="M200 240 L215 260 L297 260 L312 240 Z" fill="rgb(25, 77, 85)" />
            
            {/* Lantern bottom */}
            <path d="M215 260 L240 285 L272 285 L297 260 Z" fill="rgb(25, 77, 85)" />
            
            {/* Lantern final piece */}
            <path d="M240 285 L240 300 L272 300 L272 285 Z" fill="rgb(25, 77, 85)" />
          </svg>
        </motion.div>
        
        <motion.p
          className="mt-2 text-primary font-bold text-xl" // Larger text, closer to the loader
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          Loading...
        </motion.p>
        
        <motion.div
          className="h-1.5 w-40 bg-gray-200 rounded-full mx-auto mt-2 overflow-hidden" // Slightly taller progress bar
        >
          <motion.div
            className="h-full bg-accent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}