"use client";
import { motion } from 'framer-motion';
import { Bell, LayoutGrid, Settings, Wind, Tablet, User } from 'lucide-react';
import { useRobot } from '@/lib/robot-context';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { data } = useRobot();

  const sidebarItems = [
    { icon: LayoutGrid, active: true, tooltip: "Dashboard" },
    { icon: Bell, active: false, tooltip: "Notifications", badge: data.system.warnings.length },
    { icon: Wind, active: false, tooltip: "Environment" },
    { icon: Tablet, active: false, tooltip: "Devices" },
    { icon: Settings, active: false, tooltip: "Settings" },
  ];

  return (
    <motion.div 
      className="fixed left-0 top-0 bottom-0 w-16 flex flex-col items-center bg-black/20 backdrop-blur-md z-10 border-r border-white/10"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex flex-col h-full w-full">
        <div className="py-6 flex justify-center">
          <motion.div 
            className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            R
          </motion.div>
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-6 mt-6">
          {sidebarItems.map((item, index) => (
            <div key={index} className="relative group">
              <motion.button 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white/75 hover:text-white",
                  item.active && "bg-white/10 text-white"
                )}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={20} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </motion.button>
              <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {item.tooltip}
              </div>
            </div>
          ))}
        </div>
        
        <div className="py-6 flex justify-center">
          <motion.button 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/75 hover:text-white"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 