// ─── Global Enhancements Component ─────────────────────────────────────────────────────
// Scroll progress bar, smooth scroll, and back to top button

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useState } from 'react';

export const GlobalEnhancements = () => {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setIsVisible(latest > 0.1);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 origin-right z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Back to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 z-50 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl shadow-cyan-500/20 hover:bg-white/10 transition-colors"
          >
            <ArrowUp size={24} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
