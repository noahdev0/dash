"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RobotData } from './types';
import { mockData } from './mock-data';

interface RobotContextType {
  data: RobotData;
  selectedRoom: string;
  setSelectedRoom: (room: string) => void;
  sendCommand: (command: string) => void;
}


interface RobotProviderProps {
  children: ReactNode;
  initialStatus?: RobotData;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export function RobotProvider({ children, initialStatus }: RobotProviderProps) {
  const [data, setData] = useState<RobotData>(initialStatus || mockData as RobotData);
  const [selectedRoom, setSelectedRoom] = useState('living_room');
  
  // Initialize with custom initial status or default mock data
  useEffect(() => {
    if (initialStatus) {
      setData(initialStatus);
    }
  }, [initialStatus]);
  
  // Event handlers for commands
  const sendCommand = (command: string) => {
    console.log(`Command sent: ${command}`);
    
    // Update robot state based on the command
    const newData = { ...data };
    
    // Handle tag selection commands
    if (command.startsWith('select_tag:')) {
      const tagId = command.split(':')[1];
      newData.navigation.currentState = 'scanning';
      newData.mission.current.package.destination = tagId;
      
      // Update after a delay to simulate scanning
      setTimeout(() => {
        setData(prevData => ({
          ...prevData,
          navigation: {
            ...prevData.navigation,
            currentState: 'moving'
          }
        }));
        
        // Update after another delay to simulate delivery
        setTimeout(() => {
          setData(prevData => ({
            ...prevData,
            navigation: {
              ...prevData.navigation,
              currentState: 'delivering',
              path: {
                ...prevData.navigation.path,
                percentComplete: 50
              }
            }
          }));
          
          // Update after another delay to simulate return
          setTimeout(() => {
            setData(prevData => ({
              ...prevData,
              navigation: {
                ...prevData.navigation,
                currentState: 'returning',
                path: {
                  ...prevData.navigation.path,
                  percentComplete: 75
                }
              }
            }));
            
            // Complete the mission
            setTimeout(() => {
              setData(prevData => ({
                ...prevData,
                navigation: {
                  ...prevData.navigation,
                  currentState: 'idle',
                  path: {
                    ...prevData.navigation.path,
                    percentComplete: 100
                  }
                },
                analytics: {
                  ...prevData.analytics,
                  packagesDelivered: {
                    ...prevData.analytics.packagesDelivered,
                    today: prevData.analytics.packagesDelivered.today + 1,
                    total: prevData.analytics.packagesDelivered.total + 1
                  }
                }
              }));
              
              // Reset progress after showing 100% for a moment
              setTimeout(() => {
                setData(prevData => ({
                  ...prevData,
                  navigation: {
                    ...prevData.navigation,
                    path: {
                      ...prevData.navigation.path,
                      percentComplete: 0
                    }
                  }
                }));
              }, 2000);
            }, 3000);
          }, 2000);
        }, 3000);
      }, 2000);
    }
    else if (command === 'scan_tag') {
      newData.navigation.currentState = 'scanning';
      newData.hardware.sensors.rfidReader.status = 'scanning';
    }
    else if (command === 'deliver_package') {
      newData.navigation.currentState = 'delivering';
      newData.hardware.servoDeployer.position = 100;
      
      // Reset servo after delivery
      setTimeout(() => {
        setData(prevData => ({
          ...prevData,
          hardware: {
            ...prevData.hardware,
            servoDeployer: {
              ...prevData.hardware.servoDeployer,
              position: 0
            }
          }
        }));
      }, 1500);
    }
    else if (command === 'mission_complete') {
      newData.navigation.currentState = 'idle';
      newData.hardware.sensors.rfidReader.status = 'idle';
      newData.analytics.packagesDelivered.today += 1;
      newData.analytics.packagesDelivered.total += 1;
    }
    else if (command === 'pause') {
      newData.system.mode = 'manual';
    }
    else if (command === 'resume') {
      newData.system.mode = 'automatic';
    }
    
    setData(newData);
  };
  
  // Simulate random battery level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        // Randomly decrease battery level if it's above 20%
        if (prevData.system.battery.level > 20) {
          const newLevel = Math.max(prevData.system.battery.level - Math.random() * 0.5, 20);
          return {
            ...prevData,
            system: {
              ...prevData.system,
              battery: {
                ...prevData.system.battery,
                level: newLevel
              }
            }
          };
        }
        return prevData;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <RobotContext.Provider value={{ data, selectedRoom, setSelectedRoom, sendCommand }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobot() {
  const context = useContext(RobotContext);
  if (context === undefined) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
} 