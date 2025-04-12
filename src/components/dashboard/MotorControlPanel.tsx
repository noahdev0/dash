"use client";
import { motion } from 'framer-motion';

interface MotorControlPanelProps {
  isConnected: boolean;
  sendCommand: (command: string) => void;
  activeKeys: Set<string>;
  status: string;
  speed: number;
  handleSpeedChange: (newSpeed: number) => void;
}

export function MotorControlPanel({
  isConnected,
  sendCommand,
  activeKeys,
  status,
  speed,
  handleSpeedChange
}: MotorControlPanelProps) {
  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-5 flex flex-col gap-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">Manual Control</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-white/70">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            onClick={() => sendCommand('forward-left')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('q') 
                ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l5-5 M7 7h5 M7 7v5" />
            </svg>
            <span className="text-xs">Forward-Left</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('forward')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('w') || activeKeys.has('arrowup') 
                ? 'bg-blue-600/80 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-xs">Forward</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('forward-right')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('e') 
                ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5-5 M17 7h-5 M17 7v5" />
            </svg>
            <span className="text-xs">Forward-Right</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('left')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('a') || activeKeys.has('arrowleft') 
                ? 'bg-yellow-600/80 text-white shadow-[0_0_10px_rgba(202,138,4,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(202, 138, 4, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs">Left</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('stop')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg bg-red-600/80 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(220, 38, 38, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
            <span className="text-xs">Stop</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('right')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('d') || activeKeys.has('arrowright') 
                ? 'bg-yellow-600/80 text-white shadow-[0_0_10px_rgba(202,138,4,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(202, 138, 4, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-xs">Right</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('backward-left')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('z') 
                ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5 5 M7 17h5 M7 17v-5" />
            </svg>
            <span className="text-xs">Back-Left</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('backward')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('s') || activeKeys.has('arrowdown') 
                ? 'bg-blue-600/80 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs">Backward</span>
          </motion.button>
          
          <motion.button
            onClick={() => sendCommand('backward-right')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeKeys.has('c') 
                ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={!isConnected}
            tabIndex={-1}
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17l-5 5 M17 17h-5 M17 17v-5" />
            </svg>
            <span className="text-xs">Back-Right</span>
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
            disabled={!isConnected}
            tabIndex={-1}
          />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <motion.button
              onClick={() => handleSpeedChange(Math.max(0, speed - 10))}
              className="flex items-center justify-center gap-1 p-2 rounded-lg bg-white/10 text-white/70"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              disabled={!isConnected}
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              <span className="text-xs">Speed -10</span>
            </motion.button>
            <motion.button
              onClick={() => handleSpeedChange(Math.min(255, speed + 10))}
              className="flex items-center justify-center gap-1 p-2 rounded-lg bg-white/10 text-white/70"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              disabled={!isConnected}
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">Speed +10</span>
            </motion.button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <h3 className="text-white text-xs font-medium mb-2">Keyboard Controls</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('q') ? 'bg-purple-600/80 text-white' : 'bg-black/40 text-white/60'}`}>Q</kbd>
                <span className="text-xs text-white/60">Forward-Left</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('w') ? 'bg-blue-600/80 text-white' : 'bg-black/40 text-white/60'}`}>W</kbd>
                <span className="text-xs text-white/60">Forward</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('e') ? 'bg-purple-600/80 text-white' : 'bg-black/40 text-white/60'}`}>E</kbd>
                <span className="text-xs text-white/60">Forward-Right</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('a') ? 'bg-yellow-600/80 text-white' : 'bg-black/40 text-white/60'}`}>A</kbd>
                <span className="text-xs text-white/60">Left</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('s') ? 'bg-blue-600/80 text-white' : 'bg-black/40 text-white/60'}`}>S</kbd>
                <span className="text-xs text-white/60">Backward</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('d') ? 'bg-yellow-600/80 text-white' : 'bg-black/40 text-white/60'}`}>D</kbd>
                <span className="text-xs text-white/60">Right</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('z') ? 'bg-purple-600/80 text-white' : 'bg-black/40 text-white/60'}`}>Z</kbd>
                <span className="text-xs text-white/60">Back-Left</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('space') ? 'bg-red-600/80 text-white' : 'bg-black/40 text-white/60'}`}>Space</kbd>
                <span className="text-xs text-white/60">Stop</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-1 text-xs rounded-md transition-all ${activeKeys.has('c') ? 'bg-purple-600/80 text-white' : 'bg-black/40 text-white/60'}`}>C</kbd>
                <span className="text-xs text-white/60">Back-Right</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 