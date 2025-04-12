"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { RobotData } from "./types";
import { mockData } from "./mock-data";

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
  const [data, setData] = useState<RobotData>(
    initialStatus || (mockData as RobotData)
  );
  const [selectedRoom, setSelectedRoom] = useState("living_room");

  // Initialize with custom initial status or default mock data
  useEffect(() => {
    if (initialStatus) {
      setData(initialStatus);
    }
  }, [initialStatus]);

  // Function to update motor states based on robot navigation state
  const updateHardwareForState = (state: string, newData: RobotData) => {
    // Ensure engines exists before accessing its properties
    if (!newData.hardware.engines) {
      newData.hardware.engines = {
        leftMotor: { rpm: 0, efficiency: 0, temperature: 0, status: "idle" },
        rightMotor: { rpm: 0, efficiency: 0, temperature: 0, status: "idle" },
      };
    }

    switch (state) {
      case "idle":
        // Motors off when idle
        newData.hardware.engines.leftMotor.rpm = 0;
        newData.hardware.engines.rightMotor.rpm = 0;
        newData.hardware.engines.leftMotor.efficiency = 100;
        newData.hardware.engines.rightMotor.efficiency = 100;
        newData.hardware.engines.leftMotor.temperature = 25;
        newData.hardware.engines.rightMotor.temperature = 25;
        newData.hardware.sensors.rfidReader.status = "idle";
        newData.hardware.sensors.rfidReader.signalStrength = 0;
        newData.navigation.speed = 0;
        break;
      case "scanning":
        // Motors low power during scanning
        newData.hardware.engines.leftMotor.rpm = 5;
        newData.hardware.engines.rightMotor.rpm = 5;
        newData.hardware.engines.leftMotor.temperature = 26;
        newData.hardware.engines.rightMotor.temperature = 26;
        newData.hardware.sensors.rfidReader.status = "scanning";
        newData.hardware.sensors.rfidReader.signalStrength = 95;
        newData.navigation.speed = 0.1;
        break;
      case "moving":
        // Motors at high power during movement
        newData.hardware.engines.leftMotor.rpm = 120;
        newData.hardware.engines.rightMotor.rpm = 120;
        newData.hardware.engines.leftMotor.efficiency = 95;
        newData.hardware.engines.rightMotor.efficiency = 95;
        newData.hardware.engines.leftMotor.temperature = 42;
        newData.hardware.engines.rightMotor.temperature = 43;
        newData.hardware.sensors.rfidReader.status = "idle";
        newData.hardware.sensors.lineDetector.status = "active";
        newData.hardware.sensors.lineDetector.accuracy = 98;
        newData.navigation.speed = 0.9;
        newData.system.cpu.usage = 65;
        break;
      case "delivering":
        // Motors low power during delivery
        newData.hardware.engines.leftMotor.rpm = 0;
        newData.hardware.engines.rightMotor.rpm = 0;
        newData.hardware.engines.leftMotor.temperature = 38;
        newData.hardware.engines.rightMotor.temperature = 39;
        newData.hardware.sensors.lineDetector.status = "idle";
        newData.hardware.servoDeployer.status = "active";
        newData.hardware.servoDeployer.position = 100;
        newData.navigation.speed = 0;
        newData.system.cpu.usage = 45;
        break;
      case "returning":
        // Motors at high power during return
        newData.hardware.engines.leftMotor.rpm = 110;
        newData.hardware.engines.rightMotor.rpm = 110;
        newData.hardware.engines.leftMotor.efficiency = 90;
        newData.hardware.engines.rightMotor.efficiency = 90;
        newData.hardware.engines.leftMotor.temperature = 45;
        newData.hardware.engines.rightMotor.temperature = 46;
        newData.hardware.sensors.lineDetector.status = "active";
        newData.hardware.sensors.lineDetector.accuracy = 96;
        newData.hardware.servoDeployer.status = "idle";
        newData.hardware.servoDeployer.position = 0;
        newData.navigation.speed = 0.8;
        newData.hardware.sensors.packageDetector.status = "empty";
        newData.system.cpu.usage = 60;
        break;
    }
    return newData;
  };

  // Event handlers for commands
  const sendCommand = (command: string) => {
    console.log(`Command sent: ${command}`);

    // Update robot state based on the command
    const newData = { ...data };

    // Handle tag selection commands
    if (command.startsWith("select_tag:")) {
      const tagId = command.split(":")[1];
      newData.navigation.currentState = "scanning";
      newData.mission.current.package.destination = tagId;

      // Update hardware state for scanning
      updateHardwareForState("scanning", newData);
      setData(newData);

      // Update after a delay to simulate scanning
      setTimeout(() => {
        setData((prevData) => {
          const updatedData = {
            ...prevData,
            navigation: {
              ...prevData.navigation,
              currentState: "moving",
            },
            hardware: {
              ...prevData.hardware,
              sensors: {
                ...prevData.hardware.sensors,
                packageDetector: {
                  ...prevData.hardware.sensors.packageDetector,
                  status: "package_present",
                  weightKg: 1.2,
                },
              },
            },
          };
          return updateHardwareForState("moving", updatedData);
        });

        // Update after another delay to simulate delivery
        setTimeout(() => {
          setData((prevData) => {
            const updatedData = {
              ...prevData,
              navigation: {
                ...prevData.navigation,
                currentState: "delivering",
                path: {
                  ...prevData.navigation.path,
                  percentComplete: 50,
                },
              },
            };
            return updateHardwareForState("delivering", updatedData);
          });

          // Update after another delay to simulate return
          setTimeout(() => {
            setData((prevData) => {
              const updatedData = {
                ...prevData,
                navigation: {
                  ...prevData.navigation,
                  currentState: "returning",
                  path: {
                    ...prevData.navigation.path,
                    percentComplete: 75,
                  },
                },
              };
              return updateHardwareForState("returning", updatedData);
            });

            // Complete the mission
            setTimeout(() => {
              setData((prevData) => {
                const updatedData = {
                  ...prevData,
                  navigation: {
                    ...prevData.navigation,
                    currentState: "idle",
                    path: {
                      ...prevData.navigation.path,
                      percentComplete: 100,
                    },
                  },
                  analytics: {
                    ...prevData.analytics,
                    packagesDelivered: {
                      ...prevData.analytics.packagesDelivered,
                      today: prevData.analytics.packagesDelivered.today + 1,
                      total: prevData.analytics.packagesDelivered.total + 1,
                    },
                  },
                };
                return updateHardwareForState("idle", updatedData);
              });

              // Reset progress after showing 100% for a moment
              setTimeout(() => {
                setData((prevData) => ({
                  ...prevData,
                  navigation: {
                    ...prevData.navigation,
                    path: {
                      ...prevData.navigation.path,
                      percentComplete: 0,
                    },
                  },
                }));
              }, 2000);
            }, 3000);
          }, 2000);
        }, 3000);
      }, 2000);
    } else if (command === "scan_tag") {
      newData.navigation.currentState = "scanning";
      updateHardwareForState("scanning", newData);
      setData(newData);
    } else if (command === "deliver_package") {
      newData.navigation.currentState = "delivering";
      updateHardwareForState("delivering", newData);
      newData.hardware.servoDeployer.position = 100;

      setData(newData);

      // Reset servo after delivery
      setTimeout(() => {
        setData((prevData) => ({
          ...prevData,
          hardware: {
            ...prevData.hardware,
            servoDeployer: {
              ...prevData.hardware.servoDeployer,
              position: 0,
              status: "idle",
            },
          },
        }));
      }, 1500);
    } else if (command === "mission_complete") {
      newData.navigation.currentState = "idle";
      updateHardwareForState("idle", newData);
      newData.analytics.packagesDelivered.today += 1;
      newData.analytics.packagesDelivered.total += 1;
      setData(newData);
    } else if (command === "pause") {
      const prevState = newData.navigation.currentState;
      newData.system.mode = "manual";
      // When paused, motors should stop but keep the current state for resuming
      if (newData.hardware.engines) {
        newData.hardware.engines.leftMotor.rpm = 0;
        newData.hardware.engines.rightMotor.rpm = 0;
      }
      newData.navigation.speed = 0;
      newData._internal = { prevState }; // Store previous state for resume
      setData(newData);
    } else if (command === "resume") {
      newData.system.mode = "automatic";
      // When resumed, restore the previous state
      if (newData._internal?.prevState) {
        updateHardwareForState(newData._internal.prevState, newData);
      } else {
        // Default to idle if no previous state
        updateHardwareForState(
          newData.navigation.currentState || "idle",
          newData
        );
      }
      setData(newData);
    }
  };

  // Simulate random battery level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        // Only decrease battery if robot is not idle
        const batteryDrainFactor =
          prevData.navigation.currentState === "idle"
            ? 0.1
            : prevData.navigation.currentState === "scanning"
            ? 0.2
            : prevData.navigation.currentState === "moving"
            ? 0.4
            : prevData.navigation.currentState === "delivering"
            ? 0.3
            : prevData.navigation.currentState === "returning"
            ? 0.35
            : 0.1;

        // Randomly decrease battery level if it's above 20%
        if (prevData.system.battery.level > 20) {
          const newLevel = Math.max(
            prevData.system.battery.level - Math.random() * batteryDrainFactor,
            20
          );
          return {
            ...prevData,
            system: {
              ...prevData.system,
              battery: {
                ...prevData.system.battery,
                level: newLevel,
              },
            },
          };
        }
        return prevData;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RobotContext.Provider
      value={{ data, selectedRoom, setSelectedRoom, sendCommand }}
    >
      {children}
    </RobotContext.Provider>
  );
}

export function useRobot() {
  const context = useContext(RobotContext);
  if (context === undefined) {
    throw new Error("useRobot must be used within a RobotProvider");
  }
  return context;
}
