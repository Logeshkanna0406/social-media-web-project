import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'accent' | 'success' | 'warning' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'brand', size = 'md', icon }) => {
  const variantStyles = {
    brand: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    accent: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
