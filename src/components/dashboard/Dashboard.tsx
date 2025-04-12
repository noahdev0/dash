"use client";
import { Sidebar } from './Sidebar';
import { RobotMap } from './RobotMap';
import { ControlPanel } from './ControlPanel';
import { RobotProvider } from '@/lib/robot-context';
import { RobotData } from '@/lib/types';
import { StatusPanel } from './StatusPanel';
import { useEffect, useState } from 'react';
import { MotorControlPanel } from './MotorControlPanel';

interface DashboardProps {
  initialStatus?: RobotData;
  isConnected?: boolean;
  sendCommand?: (command: string) => void;
  activeKeys?: Set<string>;
  webSocketStatus?: string;
  speed?: number;
  handleSpeedChange?: (newSpeed: number) => void;
  esp32Ip?: string;
  setEsp32Ip?: (ip: string) => void;
  // New props for sensor data
  sensorData?: {
    distance: number;
    battery: number;
    temperature: number;
    avoidance: boolean;
    speed: number;
  };
  avoidanceMode?: boolean;
  toggleAvoidanceMode?: (enable: boolean) => void;
  executeCirclePattern?: () => void;
  executeDancePattern?: () => void;
}

export function Dashboard({ 
  initialStatus, 
  isConnected = false, 
  sendCommand = () => {}, 
  activeKeys = new Set(),
  webSocketStatus = 'disconnected',
  speed = 50,
  handleSpeedChange = () => {},
  esp32Ip = "192.168.33.97",
  setEsp32Ip = () => {},
  // Default values for new props
  sensorData = { distance: 0, battery: 0, temperature: 0, avoidance: false, speed: 50 },
  avoidanceMode = false,
  toggleAvoidanceMode = () => {},
  executeCirclePattern = () => {},
  executeDancePattern = () => {}
}: DashboardProps) {
  return (
    <RobotProvider initialStatus={initialStatus}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Sidebar />
        <div className="ml-16">
          <div className="p-6">
            {/* Custom Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">ESP32 Robot Control</h1>
                <p className="text-gray-400 mt-1">Line Follower Robot Dashboard</p>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-[#2A2A2A]/40 px-3 py-2 rounded-md border border-gray-700/50">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                  <span className="text-sm text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                
                <div className="flex-1 md:flex-none w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={esp32Ip}
                      onChange={(e) => setEsp32Ip(e.target.value)}
                      placeholder="ESP32 IP Address"
                      className="w-full md:w-56 pl-9 pr-3 py-2 text-sm bg-[#2A2A2A]/40 backdrop-blur-sm border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-200"
                      onClick={(e) => e.currentTarget.focus()}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5zm0 10a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </header>
          
            <main className="flex flex-col">
              {/* Sensor Data Display */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Distance Sensor Card */}
                <div className="bg-[#2A2A2A]/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Distance</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-2xl font-bold text-white">{sensorData.distance.toFixed(1)} cm</span>
                  </div>
                </div>
                
                {/* Battery Card */}
                <div className="bg-[#2A2A2A]/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Battery</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
                      style={{ color: sensorData.battery < 3.5 ? '#ef4444' : '#4ade80' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <span className="text-2xl font-bold" style={{ color: sensorData.battery < 3.5 ? '#ef4444' : '#4ade80' }}>
                      {sensorData.battery.toFixed(1)} V
                    </span>
                  </div>
                </div>
                
                {/* Temperature Card */}
                <div className="bg-[#2A2A2A]/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Temperature</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-2xl font-bold text-white">{sensorData.temperature.toFixed(1)} °C</span>
                  </div>
                </div>
                
                {/* Avoidance Mode Toggle */}
                <div className="bg-[#2A2A2A]/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Obstacle Avoidance</h3>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleAvoidanceMode(!avoidanceMode)}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        avoidanceMode 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {avoidanceMode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <RobotMap />
                </div>
                <div className="w-full lg:w-auto flex flex-1 flex-col gap-6">
                  {/* <ControlPanel /> */}
                  <MotorControlPanel 
                    isConnected={isConnected}
                    sendCommand={sendCommand}
                    activeKeys={activeKeys}
                    status={webSocketStatus}
                    speed={speed}
                    handleSpeedChange={handleSpeedChange}
                  />
                  
                  {/* Special Patterns Section */}
                  <div className="bg-[#1A1A1A]/60 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-white mb-4">Special Patterns</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={executeDancePattern}
                        disabled={!isConnected}
                        className={`flex items-center justify-center px-4 py-3 rounded-md transition-colors ${
                          isConnected 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Dance Pattern
                      </button>
                      <button
                        onClick={executeCirclePattern}
                        disabled={!isConnected}
                        className={`flex items-center justify-center px-4 py-3 rounded-md transition-colors ${
                          isConnected 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Circle Pattern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <StatusPanel />
            </main>
          </div>
        </div>
      </div>
    </RobotProvider>
  );
} 