"use client";
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Home, 
  Map, 
  Gamepad2, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';

interface NavButtonsProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
  onSelect?: (index: number) => void;
}

export function NavButtons({ 
  className = "", 
  variant = 'horizontal',
  onSelect
}: NavButtonsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navItems = [
    { icon: Home, label: "Home" },
    { icon: Map, label: "Map" },
    { icon: Gamepad2, label: "Controls" },
    { icon: BarChart3, label: "Stats" },
    { icon: Settings, label: "Settings" }
  ];

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (onSelect) onSelect(index);
  };

  // Determine container styles based on variant
  const containerStyles = {
    horizontal: `flex items-center justify-center gap-3 p-2 bg-black/30 backdrop-blur-md
                 rounded-full border border-white/10 shadow-lg ${className}`,
    vertical: `flex flex-col items-center gap-3 p-2 bg-black/30 backdrop-blur-md
               rounded-full border border-white/10 shadow-lg ${className}`,
    floating: `flex items-center justify-center gap-1 md:gap-3 p-2 bg-black/60 backdrop-blur-lg 
               rounded-full border border-white/20 shadow-lg ${className}`
  };

  return (
    <motion.div 
      className={containerStyles[variant]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {navItems.map((item, index) => (
        <motion.button
          key={index}
          onClick={() => handleItemClick(index)}
          className={`relative group ${
            activeIndex === index 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
              : 'bg-white/10 text-white/75 hover:bg-white/15'
          } p-3 h-12 w-12 md:h-14 md:w-14 rounded-full flex flex-col items-center justify-center transition-all duration-200`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <item.icon size={variant === 'floating' ? 20 : 18} />
          
          {/* Label tooltip that appears on hover */}
          {variant === 'floating' && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {item.label}
            </div>
          )}
          
          {/* Active indicator dot */}
          {activeIndex === index && variant === 'floating' && (
            <motion.div 
              className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full"
              layoutId="activeIndicator"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          
          {/* Show label for horizontal/vertical variant */}
          {variant !== 'floating' && index === activeIndex && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              className="mt-1 text-xs font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
} 