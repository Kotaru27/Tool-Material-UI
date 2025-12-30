import React, { InputHTMLAttributes, ButtonHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Material 3 Button ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'filled' | 'tonal' | 'outlined' | 'text' | 'danger' | 'blue' | 'red' | 'orange' | 'purple' | 'cyan' | 'emerald';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'tonal', icon, children, ...props }) => {
  const baseStyles = "h-10 px-6 rounded-full font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 select-none disabled:opacity-38 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#000000] relative overflow-hidden";
  
  const variants = {
    // Standard M3 Variants (Dark Mode)
    filled: "bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] hover:shadow-md",
    tonal: "bg-[#2A2A2A] text-[#E8DEF8] hover:bg-[#333333] hover:shadow-sm border border-[#333]",
    outlined: "border border-[#555] text-[#D0BCFF] hover:bg-[#D0BCFF]/10",
    text: "bg-transparent text-[#D0BCFF] hover:bg-[#D0BCFF]/10 px-3",
    
    // Legacy mapping
    primary: "bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8]",
    secondary: "bg-[#2A2A2A] text-[#E8DEF8] hover:bg-[#333333]",
    danger: "bg-[#3C1A1A] text-[#FFB4AB] hover:bg-[#4F2525] border border-[#552020]",
    
    // Tool Specific Colors (Vibrant Pastel on Dark)
    blue: "bg-[#0842A0] text-[#D3E3FD] hover:bg-[#0B57D0]",
    red: "bg-[#93000A] text-[#FFDAD6] hover:bg-[#BA1A1A]",
    orange: "bg-[#8B5000] text-[#FFDCC1] hover:bg-[#FFB77C]",
    purple: "bg-[#7c4dff] text-[#ffffff] hover:bg-[#651fff]",
    cyan: "bg-[#004E5F] text-[#A6EEFF] hover:bg-[#00687A]",
    emerald: "bg-[#005231] text-[#C4EED0] hover:bg-[#006C41]",
  };

  return (
    <button className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.tonal, className)} {...props}>
      {icon && <span className="mr-1 -ml-1">{icon}</span>}
      {children}
    </button>
  );
};

// --- Material 3 Filled Input ---
export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <div className="relative group w-full">
        <input
        className={cn(
            "h-12 px-4 w-full bg-[#1A1A1A] rounded-lg border border-[#333] text-[#E6E1E5] text-sm placeholder:text-[#666]",
            "focus:border-[#D0BCFF] focus:bg-[#222] focus:outline-none transition-colors duration-200",
            "hover:bg-[#222] hover:border-[#555]",
            className
        )}
        {...props}
        />
    </div>
  );
};

// --- Material 3 Select ---
export const Select: React.FC<SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <div className="relative group w-full">
        <select
        className={cn(
            "h-12 px-4 pr-10 w-full bg-[#1A1A1A] rounded-lg border border-[#333] text-[#E6E1E5] text-sm appearance-none cursor-pointer",
            "focus:border-[#D0BCFF] focus:bg-[#222] focus:outline-none transition-colors duration-200",
            "hover:bg-[#222] hover:border-[#555]",
            className
        )}
        {...props}
        >
            {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none w-4 h-4" />
    </div>
  );
};

// --- Material 3 Textarea ---
export const TextArea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  return (
    <div className="relative group w-full h-full">
        <textarea
        className={cn(
            "w-full bg-[#1A1A1A] rounded-lg border border-[#333] text-[#E6E1E5] text-sm placeholder:text-[#666] p-4 resize-none",
            "focus:border-[#D0BCFF] focus:bg-[#222] focus:outline-none transition-colors duration-200",
            "hover:bg-[#222] hover:border-[#555]",
            className
        )}
        {...props}
        />
    </div>
  );
};

// --- Material 3 Switch ---
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center gap-4 cursor-pointer select-none group">
      <div className="relative flex items-center">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {/* Track */}
        <div className={cn(
            "w-[52px] h-8 rounded-full transition-colors duration-200 border",
            checked 
                ? "bg-[#D0BCFF] border-[#D0BCFF]" 
                : "bg-[#1A1A1A] border-[#444] group-hover:border-[#666]"
        )}></div>
        
        {/* Thumb */}
        <div className={cn(
            "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center shadow-sm",
            checked 
                ? "left-[calc(100%-28px)] bg-[#381E72] w-6 h-6" 
                : "left-[6px] bg-[#888] group-hover:bg-[#AAA] w-4 h-4"
        )}>
             {checked && (
                <svg className="w-4 h-4 text-[#D0BCFF]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
             )}
        </div>
      </div>
      {label && <span className="text-sm font-medium text-[#E6E1E5]">{label}</span>}
    </label>
  );
};

// --- Material 3 Slider ---
interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
}

export const Slider: React.FC<SliderProps> = ({ label, valueDisplay, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full py-1">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#888] uppercase tracking-wider">{label}</span>
          {valueDisplay !== undefined && <span className="text-xs font-bold text-[#D0BCFF] bg-[#222] border border-[#333] px-2 py-0.5 rounded-md">{valueDisplay}</span>}
        </div>
      )}
      <input
        type="range"
        className={cn(
            "w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer",
            "accent-[#D0BCFF] hover:accent-[#E8DEF8]",
            className
        )}
        {...props}
      />
    </div>
  );
};

// --- Material 3 DropZone ---
export const DropZone: React.FC<{ onFiles: (files: File[]) => void; accept?: string; icon: React.ReactNode; label: string }> = ({ onFiles, accept, icon, label }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) onFiles(Array.from(e.dataTransfer.files));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) onFiles(Array.from(e.target.files));
  };

  return (
    <div 
      className="relative w-full min-h-[140px] border border-dashed border-[#444] hover:border-[#D0BCFF] bg-[#111] hover:bg-[#161616] rounded-[24px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <label className="cursor-pointer flex flex-col items-center gap-3 relative z-10 w-full h-full justify-center p-6">
        <input type="file" hidden multiple accept={accept} onChange={handleChange} />
        <div className="bg-[#1A1A1A] w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D0BCFF] group-hover:text-[#381E72] transition-all duration-300 text-[#666] shadow-sm border border-[#333]">
            {icon}
        </div>
        <div className="text-center">
            <span className="text-[#999] text-sm font-medium group-hover:text-[#D0BCFF] transition-colors block">{label}</span>
        </div>
      </label>
    </div>
  );
};

// --- Material 3 Card / Panel ---
// Amoled Surface (#111) with subtle border
export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn(
        "bg-[#111111] border border-[#222] rounded-[24px] p-5 shadow-sm",
        className
    )}>
        {children}
    </div>
);

// Empty State
export const EmptyState: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
    <div className="w-full h-full min-h-[300px] border border-dashed border-[#333] bg-[#0A0A0A] rounded-[32px] flex flex-col items-center justify-center gap-4 text-[#555] animate-in fade-in zoom-in duration-300">
        <div className="opacity-50 bg-[#111] p-6 rounded-3xl text-[#E6E1E5] border border-[#222]">{icon}</div>
        <p className="font-medium tracking-wide text-sm uppercase text-[#666]">{message}</p>
    </div>
);