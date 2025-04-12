'use client';

// import { Dashboard } from '../components/Dashboard';

import { Dashboard } from "@/components/dashboard/Dashboard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [esp32Ip, setEsp32Ip] = useState<string>("192.168.33.97");
  const { 
    sendCommand, 
    isConnected, 
    status, 
    sensorData, 
    avoidanceMode,
    toggleAvoidanceMode,
    executeCirclePattern,
    executeDancePattern
  } = useWebSocket(`ws://${esp32Ip}:81`);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [speed, setSpeed] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap to ensure keyboard events are always captured
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [isConnected]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isConnected) return;

      const key = e.key.toLowerCase();
      
      // Skip keyboard controls if user is typing in an input field
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Check if the key is one of our control keys
      const isControlKey = ['w', 'a', 's', 'd', 'q', 'e', 'z', 'c', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', '+', '=', '-', ' ', 'space'].includes(key);
      
      if (isControlKey) {
        // Prevent default behavior for control keys
        e.preventDefault();
        
        setActiveKeys(prev => new Set(prev).add(key === ' ' ? 'space' : key));

        switch (key) {
          case 'w':
          case 'arrowup':
            sendCommand('forward');
            break;
          case 's':
          case 'arrowdown':
            sendCommand('backward');
            break;
          case 'a':
          case 'arrowleft':
            sendCommand('left');
            break;
          case 'd':
          case 'arrowright':
            sendCommand('right');
            break;
          case 'q': // diagonal forward-left
            sendCommand('forward-left');
            break;
          case 'e': // diagonal forward-right
            sendCommand('forward-right');
            break;
          case 'z': // diagonal backward-left
            sendCommand('backward-left');
            break;
          case 'c': // diagonal backward-right
            sendCommand('backward-right');
            break;
          case ' ':
          case 'space':
            sendCommand('stop');
            break;
          case '+':
          case '=':
            handleSpeedChange(Math.min(255, speed + 10));
            break;
          case '-':
            handleSpeedChange(Math.max(0, speed - 10));
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Skip if user is typing in an input field
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Check if the key is one of our control keys
      const isControlKey = ['w', 'a', 's', 'd', 'q', 'e', 'z', 'c', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', '+', '=', '-', ' ', 'space'].includes(key);
      
      if (isControlKey) {
        e.preventDefault();
      }
      
      setActiveKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(key === ' ' ? 'space' : key);
        return newKeys;
      });

      if (['w', 'a', 'd', 'q', 'e', 'z', 'c', 'arrowup', 'arrowleft', 'arrowright'].includes(key)) {
        sendCommand('stop');
      }
    };

    // Use window event listeners for global key capture
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isConnected, sendCommand, speed]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    sendCommand(`speed:${newSpeed}`);
  };

  
  return (
    <div 
      ref={containerRef} 
      tabIndex={0} 
      className="focus:outline-none" 
      style={{ height: "100vh", width: "100vw" }}
    >
      <Dashboard 
        isConnected={isConnected}
        sendCommand={sendCommand}
        activeKeys={activeKeys}
        webSocketStatus={status}
        speed={speed}
        handleSpeedChange={handleSpeedChange}
        esp32Ip={esp32Ip}
        setEsp32Ip={setEsp32Ip}
        sensorData={sensorData}
        avoidanceMode={avoidanceMode}
        toggleAvoidanceMode={toggleAvoidanceMode}
        executeCirclePattern={executeCirclePattern}
        executeDancePattern={executeDancePattern}
      />
    </div>
  );
}
