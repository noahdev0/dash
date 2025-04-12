"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRobot } from "@/lib/robot-context";
import { Moon, Sun, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { data, sendCommand } = useRobot();
  const [activeTab, setActiveTab] = useState<"control" | "mission">("control");
  const [brightness, setBrightness] = useState(75);

  // Motion values for smooth animations
  const batteryMotion = useMotionValue(data.system.battery.level);
  const powerUsageMotion = useMotionValue(
    Math.round(data.hardware.motorLeft.currentDraw * 100)
  );
  const missionProgressMotion = useMotionValue(
    data.navigation.path.percentComplete
  );

  // Create refs to store previous values for comparison
  const prevBatteryRef = useRef(data.system.battery.level);
  const prevPowerUsageRef = useRef(
    Math.round(data.hardware.motorLeft.currentDraw * 100)
  );
  const prevProgressRef = useRef(data.navigation.path.percentComplete);

  // Calculate battery circle properties
  const batteryCircumference = 2 * Math.PI * 50; // Circle radius is 50
  const batteryOffset = useTransform(
    batteryMotion,
    (value) => batteryCircumference * (1 - value / 100)
  );

  // Effect to animate values when they change
  useEffect(() => {
    const currentBattery = data.system.battery.level;
    const currentPower = Math.round(data.hardware.motorLeft.currentDraw * 100);
    const currentProgress = data.navigation.path.percentComplete;

    if (currentBattery !== prevBatteryRef.current) {
      animate(batteryMotion, currentBattery, { duration: 0.8 });
      prevBatteryRef.current = currentBattery;
    }

    if (currentPower !== prevPowerUsageRef.current) {
      animate(powerUsageMotion, currentPower, { duration: 0.8 });
      prevPowerUsageRef.current = currentPower;
    }

    if (currentProgress !== prevProgressRef.current) {
      animate(missionProgressMotion, currentProgress, { duration: 0.8 });
      prevProgressRef.current = currentProgress;
    }
  }, [
    data.system.battery.level,
    data.hardware.motorLeft.currentDraw,
    data.navigation.path.percentComplete,
  ]);

  const handleCommandClick = (command: string) => {
    sendCommand(command);
  };

  // RFID tag color map
  const tagColors = {
    TAG1: "#ff0000", // Red
    TAG2: "#ffff00", // Yellow
    TAG3: "#00ff00", // Green
    TAG4: "#0000ff", // Blue
  };

  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 w-[300px] p-5 flex flex-col gap-5"
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
            <svg viewBox="0 0 24 24" className="text-white/70 w-full h-full">
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </motion.div>
        </div>
        <motion.button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70"
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={16} />
        </motion.button>
      </div>

      <div className="flex items-center justify-between text-white">
        <div>
          <span className="text-sm text-white/70">Power usage</span>
          <div className="flex items-center mt-1">
            <motion.span className="text-2xl font-medium">
              {useTransform(powerUsageMotion, Math.round)}
            </motion.span>
            <span className="text-sm ml-1">Kwh</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-white/70">Status</span>
          <span className="text-sm mt-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            {data.system.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className={cn(
            "text-center py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "control"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
          onClick={() => setActiveTab("control")}
        >
          Controls
        </button>
        <button
          className={cn(
            "text-center py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "mission"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
          onClick={() => setActiveTab("mission")}
        >
          Mission
        </button>
      </div>

      {activeTab === "control" && (
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
                <motion.circle
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
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
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
                onClick={() =>
                  handleCommandClick(
                    data.system.mode === "automatic" ? "pause" : "resume"
                  )
                }
              >
                <div className="w-14 h-14 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

      {activeTab === "mission" && (
        <div className="mt-2">
          <h3 className="text-white text-sm font-medium mb-3">
            Select Delivery Tag
          </h3>
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
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-white text-sm">{tag}</span>
              </motion.button>
            ))}
          </div>

          {data.navigation.currentState !== "idle" && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
              <div className="flex justify-between text-white text-sm mb-2">
                <span className="text-white/70">Mission:</span>
                <span className="font-medium capitalize">
                  {data.navigation.currentState}
                </span>
              </div>
              {data.mission.current.package.destination && (
                <div className="flex justify-between text-white text-sm mb-2">
                  <span className="text-white/70">Delivering to:</span>
                  <span className="font-medium">
                    {data.mission.current.package.destination}
                  </span>
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
          <motion.span className="text-white text-sm font-medium">
            {useTransform(batteryMotion, (value) => `${Math.round(value)}%`)}
          </motion.span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
          <motion.div
            className="bg-green-500 h-1.5 rounded-full"
            style={{
              width: useTransform(batteryMotion, (value) => `${value}%`),
            }}
          />
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-white/70 text-sm">Mission Progress</span>
          <motion.span className="text-white text-sm font-medium">
            {useTransform(
              missionProgressMotion,
              (value) => `${Math.round(value)}%`
            )}
          </motion.span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-1.5">
          <motion.div
            className="bg-purple-500 h-1.5 rounded-full"
            style={{
              width: useTransform(
                missionProgressMotion,
                (value) => `${value}%`
              ),
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
