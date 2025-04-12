"use client"
import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

// Define types for robot position and movement
export interface RobotPosition {
  x: number;
  y: number;
  orientation: number;
}
    
export interface PathPoint {
  x: number;
  y: number;
}

// Define type for sensor data from ESP32
export interface SensorData {
  distance: number;       // Distance from ultrasonic sensor in cm
  battery: number;        // Battery voltage
  temperature: number;    // Temperature reading
  avoidance: boolean;     // Whether obstacle avoidance is enabled
  speed: number;          // Current motor speed
}

export const useWebSocket = (url: string) => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<string>("Disconnected");
    const [robotPosition, setRobotPosition] = useState<RobotPosition>({ x: 0, y: 0, orientation: 0 });
    const [robotPath, setRobotPath] = useState<PathPoint[]>([]);
    const [currentPathIndex, setCurrentPathIndex] = useState<number>(0);
    const [isFollowingPath, setIsFollowingPath] = useState<boolean>(false);
    const pathTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Command queue to ensure commands are processed in order and not lost
    const commandQueue = useRef<string[]>([]);
    const processingCommand = useRef<boolean>(false);
    const lastCommandTime = useRef<number>(0);
    const COMMAND_THROTTLE_MS = 50; // Minimum time between movement commands
    
    // New state for sensor data
    const [sensorData, setSensorData] = useState<SensorData>({
        distance: 0,
        battery: 0,
        temperature: 0,
        avoidance: false,
        speed: 50
    });
    
    // New state for avoidance mode
    const [avoidanceMode, setAvoidanceMode] = useState<boolean>(false);
    
    // Connection state
    const connectionAttempts = useRef<number>(0);
    const MAX_RECONNECT_DELAY = 5000;

    // Process commands from the queue in sequence
    const processCommandQueue = useCallback(() => {
        if (processingCommand.current || commandQueue.current.length === 0 || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
            return;
        }

        processingCommand.current = true;
        const command = commandQueue.current.shift();
        
        if (command) {
            try {
                ws.current.send(command);
                console.log('Sent command:', command);
                
                // For movement commands, update last command time
                if (['forward', 'backward', 'left', 'right', 'stop', 
                     'forward-left', 'forward-right', 'backward-left', 'backward-right'].includes(command)) {
                    lastCommandTime.current = Date.now();
                }
            } catch (error) {
                console.error('Error sending command:', error);
                // Put the command back at the front of the queue
                commandQueue.current.unshift(command);
            }
        }
        
        processingCommand.current = false;
        
        // If there are more commands, process the next one
        if (commandQueue.current.length > 0) {
            setTimeout(processCommandQueue, 0);
        }
    }, []);

    const connect = useCallback(() => {
        // Check if URL is valid before attempting to connect
        if (!url || url === 'ws://:81' || url.indexOf('://') === -1) {
            setStatus("Invalid WebSocket URL");
            return;
        }
        
        if (ws.current?.readyState === WebSocket.OPEN) return;
        
        // Close existing connection if any
        if (ws.current) {
            ws.current.close();
        }

        try {
            ws.current = new WebSocket(url);
            
            // Set a timeout for the connection
            const connectionTimeout = setTimeout(() => {
                if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
                    ws.current.close();
                    setStatus("Connection timeout");
                }
            }, 5000);

            ws.current.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket connected');
                setIsConnected(true);
                setStatus("Connected");
                connectionAttempts.current = 0;
                
                // Request initial sensor data
                sendCommand('data');
            };

            ws.current.onmessage = (event) => {
                // Process incoming data
                try {
                    const data = JSON.parse(event.data);
                    
                    // Check if this is sensor data by looking for expected fields
                    if ('distance' in data && 'battery' in data && 'temperature' in data) {
                        setSensorData(prev => {
                            // Only update if values have changed significantly
                            if (Math.abs(prev.distance - data.distance) > 0.5 ||
                                Math.abs(prev.battery - data.battery) > 0.05 ||
                                Math.abs(prev.temperature - data.temperature) > 0.5 ||
                                prev.avoidance !== data.avoidance ||
                                prev.speed !== data.speed) {
                                return data;
                            }
                            return prev;
                        });
                        setAvoidanceMode(data.avoidance);
                        return;
                    }
                } catch (e) {
                    // Not JSON data, treat as status message
                    setStatus(event.data);
                }
            };

            ws.current.onclose = () => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket disconnected');
                setIsConnected(false);
                setStatus("Disconnected");
                
                // Stop path following if disconnected
                if (pathTimerRef.current) {
                    clearInterval(pathTimerRef.current);
                    pathTimerRef.current = null;
                    setIsFollowingPath(false);
                }
                
                // Exponential backoff for reconnection
                const reconnectDelay = Math.min(
                    1000 * Math.pow(1.5, connectionAttempts.current), 
                    MAX_RECONNECT_DELAY
                );
                connectionAttempts.current++;
                
                console.log(`Reconnecting in ${reconnectDelay}ms (attempt ${connectionAttempts.current})`);
                setTimeout(connect, reconnectDelay);
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setStatus("Connection error");
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            setStatus("Connection failed");
            
            // Try to reconnect
            setTimeout(connect, 3000);
        }
    }, [url]);

    const sendCommand = useCallback((command: string) => {
        // Add command to the queue
        const isMovementCommand = ['forward', 'backward', 'left', 'right', 'stop', 
                                 'forward-left', 'forward-right', 'backward-left', 'backward-right'].includes(command);
        
        // For movement commands, implement throttling
        if (isMovementCommand) {
            const now = Date.now();
            if (now - lastCommandTime.current < COMMAND_THROTTLE_MS) {
                // If we have sent a movement command very recently, update the last command instead of queuing a new one
                const lastCommand = commandQueue.current[commandQueue.current.length - 1];
                if (lastCommand && ['forward', 'backward', 'left', 'right', 'stop', 
                                   'forward-left', 'forward-right', 'backward-left', 'backward-right'].includes(lastCommand)) {
                    commandQueue.current.pop();
                }
            }
        }
        
        commandQueue.current.push(command);
        
        // Start processing the queue if not already processing
        if (!processingCommand.current) {
            processCommandQueue();
        }
    }, [processCommandQueue]);

    // New function to toggle avoidance mode
    const toggleAvoidanceMode = useCallback((enable: boolean) => {
        const command = enable ? 'avoidance_on' : 'avoidance_off';
        sendCommand(command);
        setAvoidanceMode(enable);
    }, [sendCommand]);

    // New function to request fresh sensor data
    const requestSensorData = useCallback(() => {
        sendCommand('data');
    }, [sendCommand]);

    // New functions for special movement patterns
    const executeCirclePattern = useCallback(() => {
        sendCommand('circle');
    }, [sendCommand]);

    const executeDancePattern = useCallback(() => {
        sendCommand('dance');
    }, [sendCommand]);

    // New function to set motor speed
    const setMotorSpeed = useCallback((speed: number) => {
        if (speed >= 0 && speed <= 255) {
            sendCommand(`speed:${speed}`);
        }
    }, [sendCommand]);

    // Function to determine what command to send based on current and next position
    const calculateCommand = useCallback((current: PathPoint, next: PathPoint, currentOrientation: number): string => {
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        
        // Calculate the target orientation
        let targetOrientation = 0;
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement
            targetOrientation = dx > 0 ? 0 : 180;
        } else {
            // Vertical movement
            targetOrientation = dy > 0 ? 90 : 270;
        }
        
        // Check if we need to turn or continue forward
        const orientationDiff = (targetOrientation - currentOrientation + 360) % 360;
        
        if (orientationDiff === 0) {
            return "forward"; // Continue straight
        } else if (orientationDiff === 90 || orientationDiff === -270) {
            return "right"; // Turn right
        } else if (orientationDiff === -90 || orientationDiff === 270) {
            return "left"; // Turn left
        } else if (orientationDiff === 180 || orientationDiff === -180) {
            return "stop"; // Need to turn around, stop first
        }
        
        return "forward"; // Default to forward if we can't determine
    }, []);

    // Function to update robot position based on map simulation
    const updateRobotPosition = useCallback((position: RobotPosition) => {
        setRobotPosition(position);
    }, []);

    // Function to start following a path from the map
    const startFollowingPath = useCallback((path: PathPoint[]) => {
        // Stop any existing path following
        if (pathTimerRef.current) {
            clearInterval(pathTimerRef.current);
        }
        
        setRobotPath(path);
        setCurrentPathIndex(0);
        setIsFollowingPath(true);
        
        // Start movement along path
        pathTimerRef.current = setInterval(() => {
            setCurrentPathIndex(prevIndex => {
                // If we've reached the end of the path, stop
                if (prevIndex >= path.length - 1) {
                    if (pathTimerRef.current) {
                        clearInterval(pathTimerRef.current);
                        pathTimerRef.current = null;
                    }
                    setIsFollowingPath(false);
                    sendCommand('stop');
                    return prevIndex;
                }
                
                // Calculate and send the appropriate command
                const current = path[prevIndex];
                const next = path[prevIndex + 1];
                const command = calculateCommand(
                    current, 
                    next, 
                    robotPosition.orientation
                );
                
                sendCommand(command);
                return prevIndex + 1;
            });
        }, 200); // Faster command updates for smoother movement
        
        return () => {
            if (pathTimerRef.current) {
                clearInterval(pathTimerRef.current);
                pathTimerRef.current = null;
            }
            setIsFollowingPath(false);
        };
    }, [robotPosition, sendCommand, calculateCommand]);

    // Function to stop following the path
    const stopFollowingPath = useCallback(() => {
        if (pathTimerRef.current) {
            clearInterval(pathTimerRef.current);
            pathTimerRef.current = null;
        }
        setIsFollowingPath(false);
        sendCommand('stop');
    }, [sendCommand]);

    // Setup periodic sensor data polling with optimized frequency
    useEffect(() => {
        let dataTimer: NodeJS.Timeout | null = null;
        
        if (isConnected) {
            // Less frequent polling to reduce traffic
            dataTimer = setInterval(() => {
                requestSensorData();
            }, 1000);
        }
        
        return () => {
            if (dataTimer) {
                clearInterval(dataTimer);
            }
        };
    }, [isConnected, requestSensorData]);

    // Main WebSocket connection effect
    useEffect(() => {
        connect();
        
        // Connection health check
        const healthCheck = setInterval(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                // Send small ping to keep connection alive
                try {
                    ws.current.send('ping');
                } catch (e) {
                    // If sending fails, attempt to reconnect
                    connect();
                }
            }
        }, 30000); // Every 30 seconds
        
        return () => {
            clearInterval(healthCheck);
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            
            // Clean up path following
            if (pathTimerRef.current) {
                clearInterval(pathTimerRef.current);
                pathTimerRef.current = null;
            }
        };
    }, [connect]);

    // Stable API return object to prevent unnecessary re-renders
    return useMemo(() => ({
        sendCommand,
        isConnected,
        status,
        robotPosition,
        updateRobotPosition,
        startFollowingPath,
        stopFollowingPath,
        isFollowingPath,
        // New exposed functionality
        sensorData,
        avoidanceMode,
        toggleAvoidanceMode,
        requestSensorData,
        executeCirclePattern,
        executeDancePattern,
        setMotorSpeed
    }), [
        sendCommand, isConnected, status, robotPosition, 
        updateRobotPosition, startFollowingPath, stopFollowingPath, 
        isFollowingPath, sensorData, avoidanceMode, toggleAvoidanceMode,
        requestSensorData, executeCirclePattern, executeDancePattern, 
        setMotorSpeed
    ]);
}; 