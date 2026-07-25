import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverEffect ? { y: -4, boxShadow: '0 12px 30px rgba(99, 102, 241, 0.18)' } : undefined}
      className={`glass-panel rounded-2xl p-6 shadow-glass relative overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
