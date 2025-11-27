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
  
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 active:scale-[0.98]";
  
  const variants = {
    // Apple Blue or classic Black for primary actions
    primary: "text-white bg-[#0071e3] hover:bg-[#0077ed] shadow-sm hover:shadow-md disabled:bg-blue-300", 
    // Soft gray for secondary
    secondary: "text-[#1d1d1f] bg-[#e8e8ed] hover:bg-[#dcdcde]",
    // A specific style for the 'Humanize' action if we want it distinct, otherwise map to primary
    accent: "text-white bg-[#1d1d1f] hover:bg-[#2c2c2e] shadow-sm hover:shadow-md disabled:bg-gray-400",
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