"use client";
import { motion } from 'framer-motion';
import { Cloud, Plus } from 'lucide-react';
import { useRobot } from '@/lib/robot-context';

export function Header() {
  const { data } = useRobot();
  
  // Format date similar to the UI mockup: Fri, Oct 13
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  return (
    <motion.header 
      className="flex justify-between items-center px-6 py-4 ml-16"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.div
        className="flex items-center gap-2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h1 className="text-2xl font-semibold text-white">
          Hello, NEST <span className="inline-block animate-wave">👋</span>
        </h1>
      </motion.div>

      <div className="flex items-center gap-6">
        <motion.button
          className="flex items-center gap-2 bg-black/30 hover:bg-black/40 text-white rounded-full px-4 py-2 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} />
          Add Device
        </motion.button>
        
        <motion.div 
          className="flex items-center gap-2 text-white text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Cloud size={18} />
          <span>
            {data.system.connectivity.wifi.connected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-white/70">|</span>
          <span>{formattedDate}</span>
        </motion.div>
      </div>
    </motion.header>
  );
} 