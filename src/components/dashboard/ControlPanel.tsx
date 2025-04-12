"use client";
import { motion } from 'framer-motion';
import { useRobot } from '@/lib/robot-context';
import { Moon, Sun, Settings, ChevronDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ControlPanel() {
  const { data, selectedRoom, setSelectedRoom, sendCommand } = useRobot();
  const [activeTab, setActiveTab] = useState<'control' | 'mission' | 'motor'>('motor');
  const [brightness, setBrightness] = useState(75);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [speed, setSpeed] = useState(50);
  
  // Calculate battery level for the circular progress
  const batteryLevel = data.system.battery.level;
  const batteryCircumference = 2 * Math.PI * 50; // Circle radius is 50
  const batteryOffset = batteryCircumference * (1 - batteryLevel / 100);
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data || data.system.status !== 'active') return;

      const key = e.key.toLowerCase();
      setActiveKeys(prev => new Set(prev).add(key));

      switch (key) {
        case 'w':
        case 'arrowup':
          handleCommandClick('forward');
          break;
        case 's':
        case 'arrowdown':
          handleCommandClick('stop');
          break;
        case 'a':
        case 'arrowleft':
          handleCommandClick('left');
          break;
        case 'd':
        case 'arrowright':
          handleCommandClick('right');
          break;
        case '+':
        case '=':
          handleSpeedChange(Math.min(255, speed + 10));
          break;
        case '-':
          handleSpeedChange(Math.max(0, speed - 10));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setActiveKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(key);
        return newKeys;
      });

      if (key === 'w' || key === 'arrowup' || key === 'a' || key === 'arrowleft' || 
          key === 'd' || key === 'arrowright') {
        handleCommandClick('stop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [speed, data]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    sendCommand(`speed:${newSpeed}`);
    
    // Also update the robot's data
    data.hardware.motorLeft.speed = newSpeed;
    data.hardware.motorRight.speed = newSpeed;
  };
  
  const handleCommandClick = (command: string) => {
    sendCommand(command);
    
    // Update robot data based on command
    if (command === 'forward') {
      data.hardware.motorLeft.direction = 'forward';
      data.hardware.motorRight.direction = 'forward';
    } else if (command === 'left') {
      data.hardware.motorLeft.direction = 'backward';
      data.hardware.motorRight.direction = 'forward';
    } else if (command === 'right') {
      data.hardware.motorLeft.direction = 'forward';
      data.hardware.motorRight.direction = 'backward';
    } else if (command === 'stop') {
      data.hardware.motorLeft.direction = 'stopped';
      data.hardware.motorRight.direction = 'stopped';
    }
  };
  
  // RFID tag color map
  const tagColors = {
    "TAG1": "#ff0000", // Red
    "TAG2": "#ffff00", // Yellow
    "TAG3": "#00ff00", // Green
    "TAG4": "#0000ff", // Blue
  };
  
  return (
    <motion.div 
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 w-full p-5 flex flex-col gap-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-white text-lg font-semibold">Robot Control</h2>
          <motion.div 
            className="w-4 h-4"
            animate={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="text-white/70 w-full h-full" />
          </motion.div>
        </div>
        <motion.button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={16} />
        </motion.button>
      </div>
      
      <div className="flex items-center justify-between text-white">
        <div>
          <span className="text-sm text-white/70">Power usage</span>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-medium">{Math.round(data.hardware.motorLeft.currentDraw * 100)}</span>
            <span className="text-sm ml-1">Kwh</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-white/70">Status</span>
          <span className="text-sm mt-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            {data.system.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <button 
          className={cn(
            "text-center py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === 'motor' 
              ? "bg-blue-600/80 text-white" 
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
          onClick={() => setActiveTab('motor')}
        >
          Motors
        </button>
        <button 
          className={cn(
            "text-center py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === 'control' 
              ? "bg-purple-600 text-white" 
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
          onClick={() => setActiveTab('control')}
        >
          Controls
        </button>
        <button 
          className={cn(
            "text-center py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === 'mission' 
              ? "bg-purple-600 text-white" 
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
          onClick={() => setActiveTab('mission')}
        >
          Mission
        </button>
      </div>
      
      {activeTab === 'motor' && (
        <>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                onClick={() => handleCommandClick('forward')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  activeKeys.has('w') || activeKeys.has('arrowup') 
                    ? 'bg-blue-600/80 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                    : 'bg-white/10 text-white/70'
                }`}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                disabled={data.system.status !== 'active'}
              >
                <ArrowUp size={20} className="mb-1" />
                <span className="text-xs">Forward</span>
              </motion.button>
              
              <motion.button
                onClick={() => handleCommandClick('stop')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  activeKeys.has('s') || activeKeys.has('arrowdown') 
                    ? 'bg-red-600/80 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                    : 'bg-white/10 text-white/70'
                }`}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(220, 38, 38, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                disabled={data.system.status !== 'active'}
              >
                <ArrowDown size={20} className="mb-1" />
                <span className="text-xs">Stop</span>
              </motion.button>
              
              <motion.button
                onClick={() => handleSpeedChange(100)}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/10 text-white/70"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(22, 163, 74, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                disabled={data.system.status !== 'active'}
              >
                <RotateCcw size={20} className="mb-1" />
                <span className="text-xs">Reset</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => handleCommandClick('left')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  activeKeys.has('a') || activeKeys.has('arrowleft') 
                    ? 'bg-yellow-600/80 text-white shadow-[0_0_10px_rgba(202,138,4,0.3)]' 
                    : 'bg-white/10 text-white/70'
                }`}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(202, 138, 4, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                disabled={data.system.status !== 'active'}
              >
                <ArrowLeft size={20} className="mb-1" />
                <span className="text-xs">Left</span>
              </motion.button>
              
              <motion.button
                onClick={() => handleCommandClick('right')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  activeKeys.has('d') || activeKeys.has('arrowright') 
                    ? 'bg-yellow-600/80 text-white shadow-[0_0_10px_rgba(202,138,4,0.3)]' 
                    : 'bg-white/10 text-white/70'
                }`}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(202, 138, 4, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                disabled={data.system.status !== 'active'}
              >
                <ArrowRight size={20} className="mb-1" />
                <span className="text-xs">Right</span>
              </motion.button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Speed</span>
                <div className="px-2 py-1 bg-black/40 rounded-md text-xs font-medium text-white/90">{speed} / 255</div>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={speed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 
                          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                disabled={data.system.status !== 'active'}
              />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <motion.button
                  onClick={() => handleSpeedChange(Math.max(0, speed - 10))}
                  className="flex items-center justify-center gap-1 p-2 rounded-lg bg-white/10 text-white/70"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  disabled={data.system.status !== 'active'}
                >
                  <Minus size={14} />
                  <span className="text-xs">Speed</span>
                </motion.button>
                <motion.button
                  onClick={() => handleSpeedChange(Math.min(255, speed + 10))}
                  className="flex items-center justify-center gap-1 p-2 rounded-lg bg-white/10 text-white/70"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  disabled={data.system.status !== 'active'}
                >
                  <Plus size={14} />
                  <span className="text-xs">Speed</span>
                </motion.button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/10">
              <h3 className="text-white text-xs font-medium mb-2">Keyboard Controls</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('w') ? 'bg-blue-600/80 text-white' : 'bg-black/40 text-white/60'}`}>W</kbd>
                    <span className="text-xs text-white/60">Forward</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('s') ? 'bg-red-600/80 text-white' : 'bg-black/40 text-white/60'}`}>S</kbd>
                    <span className="text-xs text-white/60">Stop</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('a') ? 'bg-yellow-600/80 text-white' : 'bg-black/40 text-white/60'}`}>A</kbd>
                    <span className="text-xs text-white/60">Left</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('d') ? 'bg-yellow-600/80 text-white' : 'bg-black/40 text-white/60'}`}>D</kbd>
                    <span className="text-xs text-white/60">Right</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'control' && (
        <>
          <div className="relative flex items-center justify-center mt-4">
            <div className="relative w-[120px] h-[120px]">
              {/* Battery level circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.1)" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke="url(#gradient)" 
                  strokeWidth="8" 
                  strokeDasharray={batteryCircumference} 
                  strokeDashoffset={batteryOffset} 
                  strokeLinecap="round" 
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Power button */}
              <motion.button 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600/50 to-blue-600/50 rounded-full m-4 focus:outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCommandClick(data.system.mode === 'automatic' ? 'pause' : 'resume')}
              >
                <div className="w-14 h-14 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
          
          {/* Brightness slider */}
          <div className="mt-4 flex items-center gap-3">
            <Moon size={16} className="text-white/70" />
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={brightness} 
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <Sun size={16} className="text-white/70" />
          </div>
        </>
      )}
      
      {activeTab === 'mission' && (
        <div className="mt-2">
          <h3 className="text-white text-sm font-medium mb-3">Select Delivery Tag</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(tagColors).map(([tag, color]) => (
              <motion.button
                key={tag}
                className="p-3 rounded-lg border border-white/10 bg-black/30 flex items-center gap-2"
                style={{ borderColor: color }}
                whileHover={{ scale: 1.03, backgroundColor: `${color}20` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCommandClick(`select_tag:${tag}`)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-white text-sm">{tag}</span>
              </motion.button>
            ))}
          </div>
          
          {data.navigation.currentState !== 'idle' && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
              <div className="flex justify-between text-white text-sm mb-2">
                <span className="text-white/70">Mission:</span>
                <span className="font-medium capitalize">{data.navigation.currentState}</span>
              </div>
              {data.mission.current.package.destination && (
                <div className="flex justify-between text-white text-sm mb-2">
                  <span className="text-white/70">Delivering to:</span>
                  <span className="font-medium">{data.mission.current.package.destination}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Robot status */}
      <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
        <div className="flex justify-between mb-2">
          <span className="text-white/70 text-sm">Battery</span>
          <span className="text-white text-sm font-medium">{data.system.battery.level}%</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
          <div 
            className="bg-green-500 h-1.5 rounded-full" 
            style={{ width: `${data.system.battery.level}%` }}
          />
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-white/70 text-sm">Mission Progress</span>
          <span className="text-white text-sm font-medium">{Math.round(data.navigation.path.percentComplete)}%</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div 
            className="bg-purple-500 h-1.5 rounded-full" 
            style={{ width: `${data.navigation.path.percentComplete}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
} 