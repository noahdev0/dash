"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Home, 
  Gamepad2, 
  Layers, 
  BarChart3, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Map
} from 'lucide-react';

interface VerticalNavButtonsProps {
  className?: string;
  onSelect?: (index: number) => void;
  initiallyCollapsed?: boolean;
  position?: 'left' | 'right';
}

export function VerticalNavButtons({ 
  className = "", 
  onSelect,
  initiallyCollapsed = false,
  position = 'left'
}: VerticalNavButtonsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  
  const navItems = [
    { icon: Home, label: "Dashboard" },
    { icon: Map, label: "Map" },
    { icon: Gamepad2, label: "Controls" },
    { icon: Layers, label: "Sensors" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" }
  ];

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (onSelect) onSelect(index);
  };

  const containerVariants = {
    expanded: { width: 180 },
    collapsed: { width: 64 }
  };
  
  const isRight = position === 'right';

  return (
    <motion.div 
      className={`fixed ${isRight ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 
                 flex flex-col items-${isRight ? 'end' : 'start'} gap-2 py-3 px-2 
                 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 
                 shadow-lg z-10 ${className}`}
      initial={initiallyCollapsed ? "collapsed" : "expanded"}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={containerVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full flex justify-between items-center mb-4 px-2">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white text-sm font-medium"
          >
            Navigation
          </motion.div>
        )}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-8 h-8 rounded-full flex items-center justify-center 
                     text-white/75 hover:text-white hover:bg-white/10
                     ml-${collapsed ? '0' : 'auto'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? 
            (isRight ? <ChevronLeft size={16} /> : <ChevronRight size={16} />) : 
            (isRight ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)
          }
        </motion.button>
      </div>
      
      {navItems.map((item, index) => (
        <motion.button
          key={index}
          onClick={() => handleItemClick(index)}
          className={`w-full h-10 rounded-lg flex items-center ${isRight ? 'justify-end' : 'justify-start'} px-3
                      transition-all duration-200 ${
                        activeIndex === index 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRight && !collapsed && (
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mr-3 text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </AnimatePresence>
          )}
          
          <item.icon size={18} />
          
          {!isRight && !collapsed && (
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </AnimatePresence>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
} 