"use client";
import { motion } from 'framer-motion';
import { useRobot } from '@/lib/robot-context';
import { Battery, Cpu, Wifi, Package, Thermometer, Gauge, Clock, RotateCcw } from 'lucide-react';

export function StatusPanel() {
  const { data } = useRobot();

  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="text-white text-lg font-semibold">Robot Status</h2>
        <p className="text-white/60 text-sm">System metrics and diagnostics</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Hardware Section */}
        <div className="col-span-2 bg-black/20 rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Gauge size={18} className="text-purple-400" />
            <span>Hardware</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Engines */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-2">Engines</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Left Motor</span>
                  <span className="text-white">{data.hardware.engines?.leftMotor.rpm || 0} RPM</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${data.hardware.engines?.leftMotor.efficiency || 0}%` }} 
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Right Motor</span>
                  <span className="text-white">{data.hardware.engines?.rightMotor.rpm || 0} RPM</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${data.hardware.engines?.rightMotor.efficiency || 0}%` }} 
                  />
                </div>
                
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-white/60">Temperature</span>
                  <span className="text-white flex items-center gap-1">
                    <Thermometer size={12} className="text-amber-400" />
                    {data.hardware.engines?.leftMotor.temperature || 0}°C
                  </span>
                </div>
              </div>
            </div>
            
            {/* Sensors */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-2">Sensors</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Line Detector</span>
                  <span className={`${data.hardware.sensors?.lineDetector?.status === "normal" ? "text-green-400" : "text-amber-400"}`}>
                    {data.hardware.sensors?.lineDetector?.accuracy || 0}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">RFID Reader</span>
                  <span className={`${data.hardware.sensors?.rfidReader?.status === "normal" ? "text-green-400" : "text-amber-400"}`}>
                    {data.hardware.sensors?.rfidReader?.signalStrength || 0}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Package Detector</span>
                  <span className={`${data.hardware.sensors?.packageDetector?.status === "package_present" ? "text-green-400" : "text-white/70"}`}>
                    {data.hardware.sensors?.packageDetector?.status === "package_present" ? "Loaded" : "Empty"}
                  </span>
                </div>
                
                <div className="flex justify-between mt-1">
                  <span className="text-white/60">Package Weight</span>
                  <span className="text-white">
                    {data.hardware.sensors?.packageDetector?.weightKg || 0} kg
                  </span>
                </div>
              </div>
            </div>
            
            {/* Battery */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="flex justify-between mb-2">
                <h4 className="text-white/70 text-xs">Battery</h4>
                <span className="text-xs text-green-400 font-medium">{data.hardware.battery?.level || 0}%</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${(data.hardware.battery?.level || 0) > 60 ? 'bg-green-500' : (data.hardware.battery?.level || 0) > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${data.hardware.battery?.level || 0}%` }} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Battery size={12} className="text-blue-400" />
                  <span className="text-white/60">Voltage:</span>
                  <span className="text-white ml-auto">{data.hardware.battery?.voltage || 0}V</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-blue-400" />
                  <span className="text-white/60">Time left:</span>
                  <span className="text-white ml-auto">{Math.floor((data.hardware.battery?.timeRemaining || 0) / 60)}h {(data.hardware.battery?.timeRemaining || 0) % 60}m</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Thermometer size={12} className="text-blue-400" />
                  <span className="text-white/60">Temp:</span>
                  <span className="text-white ml-auto">{data.hardware.battery?.temperature || 0}°C</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <RotateCcw size={12} className="text-blue-400" />
                  <span className="text-white/60">Cycles:</span>
                  <span className="text-white ml-auto">{data.hardware.battery?.cycles || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Current Package */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-2">Current Package</h4>
              
              {data.mission.current.package.id ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">ID:</span>
                    <span className="text-white font-mono">{data.mission.current.package.id}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Weight:</span>
                    <span className="text-white">{data.mission.current.package.weight} kg</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Destination:</span>
                    <span className="text-white">{data.mission.current.package.destination}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Priority:</span>
                    <span className={`${data.mission.current.package.priority === "high" ? "text-red-400" : "text-green-400"}`}>
                      {data.mission.current.package.priority}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-16 text-white/40 text-sm">
                  <Package size={16} className="mr-2" />
                  No package loaded
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* System Section */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Cpu size={18} className="text-purple-400" />
            <span>System</span>
          </h3>
          
          <div className="space-y-4">
            {/* CPU & Memory */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="flex justify-between mb-1">
                <h4 className="text-white/70 text-xs">CPU Usage</h4>
                <span className="text-xs text-white">{data.system.cpu?.usage || 0}%</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                <div 
                  className={`h-1.5 rounded-full ${(data.system.cpu?.usage || 0) > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${data.system.cpu?.usage || 0}%` }} 
                />
              </div>
              
              <div className="flex justify-between mb-1">
                <h4 className="text-white/70 text-xs">Memory</h4>
                <span className="text-xs text-white">{data.system.memory?.used || 0}/{data.system.memory?.total || 0} MB</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full" 
                  style={{ width: `${data.system.memory?.usage || 0}%` }} 
                />
              </div>
            </div>
            
            {/* Storage */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="flex justify-between mb-1">
                <h4 className="text-white/70 text-xs">Storage</h4>
                <span className="text-xs text-white">{data.system.storage?.used || 0}/{data.system.storage?.total || 0} GB</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${data.system.storage?.usage || 0}%` }} 
                />
              </div>
            </div>
            
            {/* Connectivity */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-2">Connectivity</h4>
              
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={16} className={data.system.connectivity.wifi.connected ? "text-green-400" : "text-red-400"} />
                <span className="text-white text-sm">{data.system.connectivity.wifi.network || "Not Connected"}</span>
                <span className="ml-auto text-xs bg-black/30 rounded px-2 py-0.5 text-white/70">
                  {data.system.connectivity.wifi.signalStrength || 0}%
                </span>
              </div>
            </div>
            
            {/* Uptime */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-1">System Uptime</h4>
              
              <div className="text-white text-sm font-medium">
                {Math.floor((data.system.uptime || 0) / 3600)}h {Math.floor(((data.system.uptime || 0) % 3600) / 60)}m {(data.system.uptime || 0) % 60}s
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Section */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Package size={18} className="text-purple-400" />
            <span>Navigation</span>
          </h3>
          
          <div className="space-y-4">
            {/* Current State */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-2">Current State</h4>
              
              <div className="text-white text-lg font-semibold capitalize">
                {data.navigation.currentState}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-2 w-2 rounded-full ${data.navigation.currentState !== 'idle' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-white/60 text-sm">{data.navigation.currentState !== 'idle' ? 'Mission Active' : 'Standby'}</span>
              </div>
            </div>
            
            {/* Path Progress */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="flex justify-between mb-1">
                <h4 className="text-white/70 text-xs">Path Progress</h4>
                <span className="text-xs text-white">{data.navigation.pathCompletion || 0}%</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${data.navigation.pathCompletion || 0}%` }} 
                />
              </div>
              
              <div className="flex justify-between text-xs text-white/60">
                <span>Current Route: {data.navigation.currentRoute || 'None'}</span>
                <span>Speed: {data.navigation.speed || 0} m/s</span>
              </div>
            </div>
            
            {/* Position */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <h4 className="text-white/70 text-xs mb-2">Position</h4>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-white/60 text-xs">X</span>
                  <span className="text-white font-medium">{data.navigation.position?.x || 0}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-white/60 text-xs">Y</span>
                  <span className="text-white font-medium">{data.navigation.position?.y || 0}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-white/60 text-xs">Heading</span>
                  <span className="text-white font-medium">{data.navigation.orientation || 0}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 