"use client";
import { motion } from 'framer-motion';
import { useRobot } from '@/lib/robot-context';
import { useState } from 'react';
import { 
  Battery, 
  Cpu, 
  Wifi, 
  Package, 
  Thermometer, 
  Gauge, 
  Clock, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function StatusPanel() {
  const { data } = useRobot();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    hardware: false,
    system: false,
    navigation: false
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const SectionHeader = ({ 
    icon, 
    title, 
    section, 
    description 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    section: string; 
    description?: string 
  }) => (
    <div 
      className="flex items-center justify-between cursor-pointer group"
      onClick={() => toggleSection(section)}
    >
      <div>
        <h3 className="text-white font-medium flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h3>
        {description && (
          <p className="text-white/60 text-xs hidden md:block">{description}</p>
        )}
      </div>
      <div className="text-white/70 transition-transform group-hover:text-white">
        {collapsedSections[section] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </div>
    </div>
  );

  const DataItem = ({ label, value, icon, color = "text-white" }: { label: string; value: any; icon?: React.ReactNode; color?: string }) => (
    <TooltipProvider>
      <Tooltip>
        <div className="flex justify-between text-sm items-center">
          <span className="text-white/60 flex items-center gap-1">
            {icon}
            {label}
          </span>
          <TooltipTrigger asChild>
            <span className={`${color} flex items-center gap-1 font-medium`}>
              {value}
              <Info size={12} className="text-white/30 hover:text-white/60 transition-colors" />
            </span>
          </TooltipTrigger>
        </div>
        <TooltipContent side="top">
          <p className="text-xs">Current {label.toLowerCase()}: {value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const ProgressBar = ({ 
    value, 
    color = "bg-green-500",
    height = "h-1.5"
  }: { 
    value: number; 
    color?: string;
    height?: string;
  }) => (
    <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
      <motion.div 
        className={`${color} ${height} rounded-full`}
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4 md:p-6 w-full overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="text-white text-lg font-semibold">Robot Status</h2>
        <p className="text-white/60 text-sm">System metrics and diagnostics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Hardware Section */}
        <div className="col-span-1 md:col-span-2 bg-black/20 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:border-white/20">
          <SectionHeader 
            icon={<Gauge size={18} className="text-purple-400" />} 
            title="Hardware" 
            section="hardware"
            description="Motor status, sensors, and battery"
          />
          
          {!collapsedSections.hardware && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {/* Engines */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-2">Engines</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Left Motor</span>
                    <span className="text-white">{data.hardware.engines?.leftMotor.rpm || 0} RPM</span>
                  </div>
                  <motion.div 
                    className="w-full bg-white/10 rounded-full h-1 relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="bg-green-500 h-1 rounded-full absolute" 
                      style={{ width: `${data.hardware.engines?.leftMotor.efficiency || 0}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.hardware.engines?.leftMotor.efficiency || 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Right Motor</span>
                    <span className="text-white">{data.hardware.engines?.rightMotor.rpm || 0} RPM</span>
                  </div>
                  <motion.div 
                    className="w-full bg-white/10 rounded-full h-1 relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className="bg-green-500 h-1 rounded-full absolute" 
                      style={{ width: `${data.hardware.engines?.rightMotor.efficiency || 0}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.hardware.engines?.rightMotor.efficiency || 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                  
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/60">Temperature</span>
                    <span className="text-white flex items-center gap-1">
                      <Thermometer size={12} className="text-amber-400" />
                      <motion.span 
                        initial={{ color: '#ffffff' }}
                        animate={{ 
                          color: (data.hardware.engines?.leftMotor.temperature || 0) > 70 ? '#ef4444' : '#ffffff' 
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {data.hardware.engines?.leftMotor.temperature || 0}°C
                      </motion.span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sensors */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-2">Sensors</h4>
                
                <div className="space-y-2 text-sm">
                  <DataItem 
                    label="Line Detector" 
                    value={`${data.hardware.sensors?.lineDetector?.accuracy || 0}%`} 
                    color={data.hardware.sensors?.lineDetector?.status === "normal" ? "text-green-400" : "text-amber-400"}
                  />
                  
                  <DataItem 
                    label="RFID Reader" 
                    value={`${data.hardware.sensors?.rfidReader?.signalStrength || 0}%`} 
                    color={data.hardware.sensors?.rfidReader?.status === "normal" ? "text-green-400" : "text-amber-400"}
                  />
                  
                  <DataItem 
                    label="Package Detector" 
                    value={data.hardware.sensors?.packageDetector?.status === "package_present" ? "Loaded" : "Empty"} 
                    color={data.hardware.sensors?.packageDetector?.status === "package_present" ? "text-green-400" : "text-white/70"}
                  />
                  
                  <DataItem 
                    label="Package Weight" 
                    value={`${data.hardware.sensors?.packageDetector?.weightKg || 0} kg`} 
                  />
                </div>
              </div>
              
              {/* Battery */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <div className="flex justify-between mb-2">
                  <h4 className="text-white/70 text-xs">Battery</h4>
                  <motion.span 
                    className="text-xs font-medium"
                    animate={{ 
                      color: (data.hardware.battery?.level || 0) > 60 ? '#22c55e' : (data.hardware.battery?.level || 0) > 30 ? '#f59e0b' : '#ef4444'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {data.hardware.battery?.level || 0}%
                  </motion.span>
                </div>
                
                <motion.div 
                  className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className={`h-2 rounded-full ${getBatteryColor(data.hardware.battery?.level || 0)}`}
                    style={{ width: `${data.hardware.battery?.level || 0}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.hardware.battery?.level || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
                
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
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-2">Current Package</h4>
                
                {data.mission.current.package.id ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <DataItem 
                      label="ID" 
                      value={data.mission.current.package.id} 
                    />
                    
                    <DataItem 
                      label="Weight" 
                      value={`${data.mission.current.package.weight} kg`} 
                    />
                    
                    <DataItem 
                      label="Destination" 
                      value={data.mission.current.package.destination} 
                    />
                    
                    <DataItem 
                      label="Priority" 
                      value={data.mission.current.package.priority} 
                      color={data.mission.current.package.priority === "high" ? "text-red-400" : "text-green-400"}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex items-center justify-center h-16 text-white/40 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Package size={16} className="mr-2" />
                    No package loaded
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* System Section */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:border-white/20">
          <SectionHeader 
            icon={<Cpu size={18} className="text-purple-400" />} 
            title="System" 
            section="system"
            description="CPU, memory, and connectivity"
          />
          
          {!collapsedSections.system && (
            <motion.div 
              className="space-y-4 mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {/* CPU & Memory */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <div className="flex justify-between mb-1">
                  <h4 className="text-white/70 text-xs">CPU Usage</h4>
                  <motion.span 
                    className="text-xs text-white"
                    animate={{ color: (data.system.cpu?.usage || 0) > 80 ? '#ef4444' : '#ffffff' }}
                  >
                    {data.system.cpu?.usage || 0}%
                  </motion.span>
                </div>
                
                <ProgressBar 
                  value={data.system.cpu?.usage || 0} 
                  color={(data.system.cpu?.usage || 0) > 80 ? 'bg-red-500' : 'bg-blue-500'} 
                />
                
                <div className="flex justify-between mb-1">
                  <h4 className="text-white/70 text-xs">Memory</h4>
                  <span className="text-xs text-white">{data.system.memory?.used || 0}/{data.system.memory?.total || 0} MB</span>
                </div>
                
                <ProgressBar value={data.system.memory?.usage || 0} color="bg-purple-500" />
              </div>
              
              {/* Storage */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <div className="flex justify-between mb-1">
                  <h4 className="text-white/70 text-xs">Storage</h4>
                  <span className="text-xs text-white">{data.system.storage?.used || 0}/{data.system.storage?.total || 0} GB</span>
                </div>
                
                <ProgressBar value={data.system.storage?.usage || 0} color="bg-green-500" />
              </div>
              
              {/* Connectivity */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-2">Connectivity</h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ 
                      scale: data.system.connectivity.wifi.connected ? [1, 1.2, 1] : 1,
                      opacity: data.system.connectivity.wifi.connected ? 1 : 0.6 
                    }}
                    transition={{ 
                      repeat: data.system.connectivity.wifi.connected ? Infinity : 0,
                      duration: 1.5,
                      repeatType: "reverse"
                    }}
                  >
                    <Wifi 
                      size={16} 
                      className={data.system.connectivity.wifi.connected ? "text-green-400" : "text-red-400"} 
                    />
                  </motion.div>
                  <span className="text-white text-sm">{data.system.connectivity.wifi.network || "Not Connected"}</span>
                  <span className="ml-auto text-xs bg-black/30 rounded px-2 py-0.5 text-white/70">
                    {data.system.connectivity.wifi.signalStrength || 0}%
                  </span>
                </div>
              </div>
              
              {/* Uptime */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-1">System Uptime</h4>
                
                <div className="text-white text-sm font-medium">
                  {formatUptime(data.system.uptime || 0)}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Navigation Section */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:border-white/20">
          <SectionHeader 
            icon={<Package size={18} className="text-purple-400" />} 
            title="Navigation" 
            section="navigation"
            description="Position, route, and mission status"
          />
          
          {!collapsedSections.navigation && (
            <motion.div 
              className="space-y-4 mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {/* Current State */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-2">Current State</h4>
                
                <motion.div 
                  className="text-white text-lg font-semibold capitalize"
                  animate={{ 
                    scale: data.navigation.currentState !== 'idle' ? [1, 1.03, 1] : 1
                  }}
                  transition={{ 
                    repeat: data.navigation.currentState !== 'idle' ? Infinity : 0,
                    duration: 2,
                    repeatType: "reverse"
                  }}
                >
                  {data.navigation.currentState}
                </motion.div>
                
                <div className="flex items-center gap-2 mt-2">
                  <motion.div 
                    className={`h-2 w-2 rounded-full ${data.navigation.currentState !== 'idle' ? 'bg-green-500' : 'bg-amber-500'}`}
                    animate={{ 
                      opacity: data.navigation.currentState !== 'idle' ? [1, 0.4, 1] : 1
                    }}
                    transition={{ 
                      repeat: data.navigation.currentState !== 'idle' ? Infinity : 0,
                      duration: 1,
                      repeatType: "reverse"
                    }}
                  />
                  <span className="text-white/60 text-sm">{data.navigation.currentState !== 'idle' ? 'Mission Active' : 'Standby'}</span>
                </div>
              </div>
              
              {/* Path Progress */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <div className="flex justify-between mb-1">
                  <h4 className="text-white/70 text-xs">Path Progress</h4>
                  <span className="text-xs text-white">{data.navigation.pathCompletion || 0}%</span>
                </div>
                
                <motion.div 
                  className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="bg-purple-500 h-2 rounded-full relative" 
                    style={{ width: `${data.navigation.pathCompletion || 0}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.navigation.pathCompletion || 0}%` }}
                    transition={{ duration: 0.5 }}
                  >
                    {(data.navigation.pathCompletion || 0) > 5 && (
                      <motion.div 
                        className="absolute right-0 top-0 h-full w-1 bg-white/30"
                        animate={{ 
                          opacity: [0.2, 0.7, 0.2]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 1.5
                        }}
                      />
                    )}
                  </motion.div>
                </motion.div>
                
                <div className="flex justify-between text-xs text-white/60">
                  <span>Route: {data.navigation.currentRoute || 'None'}</span>
                  <span>Speed: {data.navigation.speed || 0} m/s</span>
                </div>
              </div>
              
              {/* Position */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors">
                <h4 className="text-white/70 text-xs mb-2">Position</h4>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <motion.div 
                    className="flex flex-col"
                    animate={{ 
                      y: data.navigation.currentState !== 'idle' ? [0, -2, 0] : 0
                    }}
                    transition={{ 
                      repeat: data.navigation.currentState !== 'idle' ? Infinity : 0,
                      duration: 2,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="text-white/60 text-xs">X</span>
                    <span className="text-white font-medium">{data.navigation.position?.x || 0}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col"
                    animate={{ 
                      y: data.navigation.currentState !== 'idle' ? [0, -2, 0] : 0
                    }}
                    transition={{ 
                      repeat: data.navigation.currentState !== 'idle' ? Infinity : 0,
                      duration: 2,
                      delay: 0.3,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="text-white/60 text-xs">Y</span>
                    <span className="text-white font-medium">{data.navigation.position?.y || 0}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col"
                    animate={{ 
                      y: data.navigation.currentState !== 'idle' ? [0, -2, 0] : 0
                    }}
                    transition={{ 
                      repeat: data.navigation.currentState !== 'idle' ? Infinity : 0,
                      duration: 2,
                      delay: 0.6,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="text-white/60 text-xs">Heading</span>
                    <span className="text-white font-medium">{data.navigation.orientation || 0}°</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 