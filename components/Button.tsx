import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}) => {
  
  // Radius: 1rem (rounded-2xl)
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-2xl transition-all duration-300 active:scale-[0.98] font-sans tracking-wide border";
  
  const variants = {
    // Cosmic Primary: Neon Gradient with Glow
    primary: "text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-white/10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.7)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed", 
    
    // Cosmic Secondary: Dark translucent
    secondary: "text-zinc-300 bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 shadow-none disabled:opacity-50",
    
    // Accent: Dark zinc
    accent: "text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700 disabled:opacity-50",
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${isLoading || disabled ? 'cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin absolute" />}
      <span className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
};