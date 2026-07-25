import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-300 tracking-wide">{label}</label>}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          className={`w-full glass-input rounded-xl py-2.5 text-sm text-slate-100 placeholder-slate-400 ${icon ? 'pl-10 pr-4' : 'px-4'} ${error ? 'border-rose-500/60 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};
