"use client";
import { motion } from 'framer-motion';
import { useRobot } from '@/lib/robot-context';
import { ZoomIn, ZoomOut, Package, Home, Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import { useWebSocket, PathPoint } from '@/hooks/useWebSocket';

export function RobotMap() {
  const { data, sendCommand: sendRobotCommand } = useRobot();
  const [zoom, setZoom] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0, orientation: 0 });
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [pathProgress, setPathProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [missionState, setMissionState] = useState<'idle' | 'scanning' | 'moving' | 'delivering' | 'returning'>('idle');
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [esp32Ip, setEsp32Ip] = useState<string>("192.168.33.97");
  const { updateRobotPosition, startFollowingPath, stopFollowingPath, isFollowingPath } = useWebSocket(`ws://${esp32Ip}:81`);
  
  // Get ESP32 IP from local storage if available
  useEffect(() => {
    const storedIp = localStorage.getItem('esp32Ip');
    if (storedIp) {
      setEsp32Ip(storedIp);
    }
    // Default IP is already set in the initial state
  }, []);
  
  // Total map dimensions (150x150)
  const mapWidth = 1500;
  const mapHeight = 1500;
  
  // Track dimensions in cm (120x120)
  const trackDimensions = {
    width: 120, // 1.2m
    height: 120, // 1.2m
    leftSegment: 45,
    middleSegment: 45,
    rightSegment: 30,
    topSegment: 50,
    verticalHeight: 120 // 1.2m
  };

  // Calculate the offset to center the path in the map
  const offsetX = (150 - trackDimensions.width) / 2; // 15
  const offsetY = (150 - trackDimensions.height) / 2; // 15

  // Define the robot's movement path that follows the exact description
  const robotPathPoints: PathPoint[] = [
    // Start at home position (0,0)
    { x: 0, y: 0 },  
    
    // Run right for 67.5 units to first intersection
    { x: 67.5, y: 0 },
    
    // Go down 90 degrees for 50 units
    { x: 67.5, y: 50 },
    
    // Go left 90 degrees for 22.5 units
    { x: 45, y: 50 },
    
    // Go down 90 degrees for 70 units to bottom
    { x: 45, y: 120 },
    
    // Return to second intersection
    { x: 45, y: 50 },
    { x: 67.5, y: 50 },
    
    // Take the other branch - go right for 22.5 units
    { x: 90, y: 50 },
    
    // Go down to bottom
    { x: 90, y: 120 },
    
    // Return to first intersection
    { x: 90, y: 50 },
    { x: 67.5, y: 50 },
    { x: 67.5, y: 0 },
    
    // Continue forward for 52.5 more units to right edge
    { x: 120, y: 0 },
    
    // Turn right for 120 units (down to bottom-right corner)
    { x: 120, y: 120 },
    
    // Turn right for 120 units (left to bottom-left corner)
    { x: 0, y: 120 },
    
    // Return to start (home position)
    { x: 0, y: 0 }
  ];

  // Define RFID tag positions at key intersections
  const rfidTags = [
    { 
      id: "TAG1", 
      color: "#ff5252", 
      x: 67.5, 
      y: 0, 
      width: 6, 
      height: 6,
      label: "Pickup Station",
      icon: "📦"
    },
    { 
      id: "TAG2", 
      color: "#FFD700", 
      x: 120, 
      y: 60, 
      width: 6, 
      height: 6,
      label: "Assembly Line",
      icon: "🔧"
    },
    { 
      id: "TAG3", 
      color: "#4CAF50", 
      x: 45, 
      y: 120, 
      width: 6, 
      height: 6,
      label: "Quality Control",
      icon: "✓"
    },
    { 
      id: "TAG4", 
      color: "#2196F3", 
      x: 90, 
      y: 120, 
      width: 6, 
      height: 6,
      label: "Shipping Area",
      icon: "🚚"
    }
  ];

  // Create a loop by adding the first point at the end
  const closedPath = [...robotPathPoints, robotPathPoints[0]];
  
  // Initialize active path as the default closed path
  const [activePath, setActivePath] = useState(closedPath);
  // Hover state for tags
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  // Calculate the total path length
  const calculatePathLength = (points: PathPoint[]): number => {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  };

  const totalPathLength = calculatePathLength(activePath);

  // Scale a cm position to the map size, accounting for the offset
  const scalePosition = (pos: number, dimension: number) => {
    // Convert the position to the appropriate scale and add the offset
    return ((pos + offsetX) / 150) * dimension;
  };

  // Function to get point on path based on progress (0 to 1)
  const getPointOnPath = (progress: number): { point: PathPoint, orientation: number } => {
    if (progress <= 0) return { point: { x: -offsetX, y: -offsetY }, orientation: 270 }; // Adjust home position with offset
    if (progress >= 1) return { point: { x: -offsetX, y: -offsetY }, orientation: 270 }; // Adjust home position with offset

    const targetDistance = progress * totalPathLength;
    let coveredDistance = 0;
    
    for (let i = 1; i < activePath.length; i++) {
      const prevPoint = activePath[i-1];
      const currentPoint = activePath[i];
      
      const dx = currentPoint.x - prevPoint.x;
      const dy = currentPoint.y - prevPoint.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      if (coveredDistance + segmentLength >= targetDistance) {
        // We found the segment where the point should be
        const segmentProgress = (targetDistance - coveredDistance) / segmentLength;
        const x = prevPoint.x + dx * segmentProgress;
        const y = prevPoint.y + dy * segmentProgress;
        
        // Calculate orientation (in degrees)
        let orientation = 0;
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          orientation = dx > 0 ? 0 : 180;
        } else {
          // Vertical movement
          orientation = dy > 0 ? 90 : 270;
        }
        
        return { point: { x, y }, orientation };
      }
      
      coveredDistance += segmentLength;
    }
    
    // Fallback (should never reach here)
    return { point: { x: -offsetX, y: -offsetY }, orientation: 0 };
  };

  // Create path strings for each inner segment
  const innerPathSegments: { start: PathPoint, end: PathPoint }[] = [
    // From first intersection going down (90 degrees right) for 50 units
    { start: { x: 67.5, y: 0 }, end: { x: 67.5, y: 50 } },
    
    // First path branch: 90 degrees right for 22.5 units
    { start: { x: 67.5, y: 50 }, end: { x: 45, y: 50 } },
    
    // First path continues down for 70 units
    { start: { x: 45, y: 50 }, end: { x: 45, y: 120 } },
    
    // Second path branch: 90 degrees left (going right from intersection)
    { start: { x: 67.5, y: 50 }, end: { x: 90, y: 50 } },
    
    // Second path continues down to bottom
    { start: { x: 90, y: 50 }, end: { x: 90, y: 120 } }
  ];

  // Convert the path points to SVG path string
  const createPathString = (points: PathPoint[]): string => {
    if (points.length === 0) return "";
    
    let path = `M ${scalePosition(points[0].x, mapWidth)} ${scalePosition(points[0].y, mapHeight)}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${scalePosition(points[i].x, mapWidth)} ${scalePosition(points[i].y, mapHeight)}`;
    }
    
    return path;
  };

  // Create path string for the main robot path
  const pathString = createPathString(activePath);
  
  // Create path strings for each inner segment
  const innerPathStrings = innerPathSegments.map(segment => {
    return `M ${scalePosition(segment.start.x, mapWidth)} ${scalePosition(segment.start.y, mapHeight)} L ${scalePosition(segment.end.x, mapWidth)} ${scalePosition(segment.end.y, mapHeight)}`;
  });

  // Function to generate a path to a specific tag and back
  const generatePathToTag = (tagId: string): PathPoint[] => {
    // Find the tag
    const tag = rfidTags.find(t => t.id === tagId);
    if (!tag) return closedPath;
    
    // Create a path from home to tag - always start at exact (0,0)
    const path: PathPoint[] = [
      { x: 0, y: 0 }, // Start at home position
      { x: 67.5, y: 0 }, // Move to first intersection
    ];
    
    // Add tag-specific path
    switch(tagId) {
      case 'TAG1': // Red tag
        // Already at intersection
        break;
      case 'TAG2': // Yellow tag
        path.push({ x: 120, y: 0 }); // Move to right edge
        path.push({ x: 120, y: 60 }); // Move down to tag
        break;
      case 'TAG3': // Green tag
        path.push({ x: 67.5, y: 50 }); // Move to second intersection
        path.push({ x: 45, y: 50 }); // Move left
        path.push({ x: 45, y: 120 }); // Move down to tag
        break;
      case 'TAG4': // Blue tag
        path.push({ x: 67.5, y: 50 }); // Move to second intersection
        path.push({ x: 90, y: 50 }); // Move right
        path.push({ x: 90, y: 120 }); // Move down to tag
        break;
    }
    
    // Add return path (explicitly reversing the route)
    const returnPath = [...path].reverse();
    
    // Ensure first and last points are exactly at home coordinates (0,0)
    returnPath[returnPath.length - 1] = { x: 0, y: 0 };
    
    // Combine outbound and return paths without duplicating the tag location
    return [...path, ...returnPath.slice(1)];
  };

  // Handle tag selection
  const handleTagSelect = (tagId: string) => {
    if (missionState !== 'idle') return;
    
    setSelectedTag(tagId);
    setIsMapVisible(true); // Ensure map is visible when mission starts
    
    // Update robot state in data context
    sendRobotCommand('scan_tag');
    
    // Start mission sequence
    setMissionState('scanning');
    
    // Generate path to selected tag
    const newPath = generatePathToTag(tagId);
    setActivePath([...newPath, newPath[0]]); // Close the path
    
    // Send the path to the WebSocket hook for physical robot control
    startFollowingPath(newPath);
    
    // Start scanning animation
    setTimeout(() => {
      setMissionState('moving');
      setIsAnimating(true);
    }, 2000);
  };

  // Animation effect
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Stop the physical robot if animation is stopped
      if (isFollowingPath) {
        stopFollowingPath();
      }
      
      return;
    }

    const startTime = Date.now();
    const duration = 20000 / animationSpeed; // 20 seconds for a complete loop at normal speed
    
    // Calculate the starting progress based on current mission state
    let startProgress = pathProgress;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      // Calculate new progress based on mission state
      let newProgress;
      if (missionState === 'moving') {
        // When moving to the destination, go from 0 to 0.5 (halfway point)
        newProgress = Math.min(startProgress + (elapsed / duration), 0.5);
      } else if (missionState === 'returning') {
        // When returning, go from 0.5 to 1
        newProgress = Math.min(0.5 + (elapsed / duration), 1);
      } else {
        // Default animation when not on a mission
        newProgress = (startProgress + elapsed / duration) % 1;
      }
      
      setPathProgress(newProgress);
      const { point, orientation } = getPointOnPath(newProgress);
      
      const newRobotPosition = {
        x: scalePosition(point.x, mapWidth),
        y: scalePosition(point.y, mapHeight),
        orientation
      };
      
      setRobotPosition(newRobotPosition);
      
      // Update robot position in WebSocket hook for physical robot control
      updateRobotPosition({
        x: point.x,
        y: point.y,
        orientation
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, missionState, pathProgress, isFollowingPath, stopFollowingPath, updateRobotPosition]);

  // Handle mission state changes
  useEffect(() => {
    if (missionState === 'moving' && pathProgress >= 0.5) {
      // Robot reached the tag (midpoint of path)
      setMissionState('delivering');
      
      // Pause animation briefly for delivery
      setIsAnimating(false);
      
      // Show delivery animation
      setTimeout(() => {
        sendRobotCommand('deliver_package');
        
        // Continue the journey back
        setTimeout(() => {
          setMissionState('returning');
          setIsAnimating(true);
        }, 1500);
      }, 1000);
    }
    
    if (missionState === 'returning' && pathProgress >= 0.99) {
      // Mission complete - ensure robot is at home position
      setIsAnimating(false);
      
      // Force position to exact home coordinates
      setRobotPosition({
        x: scalePosition(0, mapWidth),
        y: scalePosition(0, mapHeight),
        orientation: 270
      });
      
      // Update physical robot position
      updateRobotPosition({
        x: 0,
        y: 0,
        orientation: 270
      });
      
      // Show mission complete notification
      const completionIndicator = document.createElement('div');
      completionIndicator.className = 'fixed inset-0 flex items-center justify-center z-50';
      completionIndicator.innerHTML = `
        <div class="bg-green-500/80 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span class="font-medium">Mission Complete!</span>
        </div>
      `;
      document.body.appendChild(completionIndicator);
      
      // Remove notification after 2 seconds
      setTimeout(() => {
        document.body.removeChild(completionIndicator);
        // Reset mission state
        setMissionState('idle');
        setSelectedTag(null);
        setActivePath(closedPath);
        setPathProgress(0);
        sendRobotCommand('mission_complete');
      }, 2000);
    }
  }, [pathProgress, missionState, updateRobotPosition, sendRobotCommand]);

  // Handle zoom
  const increaseZoom = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const decreaseZoom = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const resetZoom = () => setZoom(1);

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(prev => !prev);
  };
  
  // Reset animation
  const resetAnimation = () => {
    setIsAnimating(false);
    setPathProgress(0);
    const { point, orientation } = getPointOnPath(0);
    setRobotPosition({
      x: scalePosition(point.x, mapWidth),
      y: scalePosition(point.y, mapHeight),
      orientation
    });
    
    // Reset the physical robot
    updateRobotPosition({
      x: point.x,
      y: point.y,
      orientation
    });
    
    // Stop following path if active
    if (isFollowingPath) {
      stopFollowingPath();
    }
  };
  
  // Increase animation speed
  const increaseSpeed = () => setAnimationSpeed(prev => Math.min(prev + 0.5, 3));

  // Handle communication from ControlPanel
  useEffect(() => {
    // Listen for commands from the control panel
    if (data.navigation.currentState === 'scanning' && missionState === 'idle') {
      // When control panel initiates a scan, start our mission sequence
      const targetTag = data.mission.current.package.destination;
      if (targetTag && targetTag.startsWith('TAG')) {
        setSelectedTag(targetTag);
        setMissionState('scanning');
        
        // Generate path to selected tag
        const newPath = generatePathToTag(targetTag);
        setActivePath([...newPath, newPath[0]]); // Close the path
        
        // Send the path to the WebSocket hook for physical robot control
        startFollowingPath(newPath);
        
        // Start scanning animation
        setTimeout(() => {
          setMissionState('moving');
          setIsAnimating(true);
        }, 2000);
      }
    }
  }, [data.navigation.currentState, data.mission.current.package.destination, missionState, startFollowingPath]);

  // Function to find the closest point on the path to a given tag
  const getClosestPointOnPath = (tag: typeof rfidTags[0]): PathPoint => {
    let closestPoint = robotPathPoints[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const point of robotPathPoints) {
      const dx = point.x - tag.x;
      const dy = point.y - tag.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    return closestPoint;
  };

  return (
    <motion.div 
      className="w-full h-full bg-black/30 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="bg-gradient-to-r from-purple-900/80 to-black/60 p-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="text-white font-semibold">Line Following Robot Simulator</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-white text-xs flex items-center gap-2">
            <span className="text-white/70">Status:</span>
            <span className={`${isAnimating ? 'text-green-400' : 'text-amber-400'} font-medium`}>
              {isAnimating ? 'Running' : 'Paused'}
            </span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="text-white text-xs">
            <span className="text-white/70">Speed:</span> {animationSpeed.toFixed(1)}x
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-between items-start h-[calc(100%-3rem)]">
        <div className="flex-1 relative h-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              style={{ 
                scale: zoom,
                transformOrigin: 'center center',
                opacity: isMapVisible ? 1 : 0,
                width: '95%',
                height: '95%'
              }}
              className="relative flex items-center justify-center"
              drag={zoom > 1}
              dragConstraints={{
                top: -100,
                left: -100,
                right: 100,
                bottom: 100
              }}
            >
              {/* Map grid */}
              <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
                className="map-grid"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background */}
                <defs>
                  <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                  </pattern>
                  <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#smallGrid)"/>
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                <rect
                  x="0"
                  y="0"
                  width={mapWidth}
                  height={mapHeight}
                  fill="#161616" 
                  fillOpacity="0.5"
                />
                
                <rect
                  x="0"
                  y="0"
                  width={mapWidth}
                  height={mapHeight}
                  fill="url(#grid)"
                />
                
                {/* Map border - highlight the 150x150 area */}
                <rect 
                  x="0" 
                  y="0" 
                  width={mapWidth} 
                  height={mapHeight} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="8" 
                  strokeDasharray="20,10"
                />
                
                {/* Inner area - highlight the 120x120 robot path area */}
                <rect 
                  x={scalePosition(0, mapWidth)} 
                  y={scalePosition(0, mapHeight)} 
                  width={scalePosition(trackDimensions.width, mapWidth) - scalePosition(0, mapWidth)} 
                  height={scalePosition(trackDimensions.height, mapHeight) - scalePosition(0, mapHeight)} 
                  fill="none" 
                  stroke="rgba(147, 51, 234, 0.3)" 
                  strokeWidth="4"
                  strokeDasharray="10,10" 
                />
                
                {/* Path with glow effect */}
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Robot path outline */}
                <path 
                  d={pathString}
                  stroke="white" 
                  strokeWidth="5" 
                  fill="none"
                  filter="url(#glow)"
                />
                
                {/* Render inner path segments */}
                {innerPathStrings.map((pathString, index) => (
                  <path
                    key={`inner-path-${index}`}
                    d={pathString}
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="4"
                    fill="none"
                    filter="url(#glow)"
                  />
                ))}
                
                {/* Path progress overlay */}
                <path 
                  d={pathString}
                  stroke="rgba(147, 51, 234, 0.7)" 
                  strokeWidth="6" 
                  fill="none"
                  strokeDasharray={`${pathProgress * totalPathLength * (mapWidth/trackDimensions.width)}, ${totalPathLength * (mapWidth/trackDimensions.width)}`}
                  strokeLinecap="round"
                />
                
                {/* RFID Tags */}
                {rfidTags.map((tag, index) => {
                  // Only allow hover effect when not in a mission or if this is the selected tag
                  const isInteractive = missionState === 'idle' || selectedTag === tag.id;
                  const shouldScale = 
                    selectedTag === tag.id ? 1.1 : 
                    (hoveredTag === tag.id && isInteractive) ? 1.05 : 
                    1;
                    
                  return (
                    <g 
                      key={tag.id}
                      onClick={() => missionState === 'idle' && handleTagSelect(tag.id)}
                      onMouseEnter={() => isInteractive && setHoveredTag(tag.id)}
                      onMouseLeave={() => setHoveredTag(null)}
                      style={{ cursor: isInteractive ? 'pointer' : 'default' }}
                      transform={`translate(${scalePosition(tag.x, mapWidth)}, ${scalePosition(tag.y, mapHeight)})`}
                    >
                      {/* Tag location marker */}
                      <defs>
                        <filter id={`glow-${tag.id}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="5" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <radialGradient id={`grad-${tag.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor={tag.color} stopOpacity="0.7" />
                          <stop offset="100%" stopColor={tag.color} stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      
                      {/* Tag highlight/selection area - this will scale when active */}
                      <g 
                        transform={`scale(${shouldScale})`} 
                        style={{ transformOrigin: '0px 0px', transition: 'transform 0.3s ease-out' }}
                      >
                        {/* Tag highlight area */}
                        <circle 
                          cx="0" 
                          cy="0" 
                          r="120" 
                          fill={`url(#grad-${tag.id})`}
                          opacity={selectedTag === tag.id ? "0.7" : hoveredTag === tag.id && isInteractive ? "0.6" : "0.2"}
                          style={{ transition: 'opacity 0.3s ease-out' }}
                        />
                        
                        {/* Pulse animation for selected tag */}
                        {(selectedTag === tag.id) && (
                          <circle 
                            cx="0" 
                            cy="0" 
                            r="100" 
                            fill="none"
                            stroke={tag.color}
                            strokeWidth="4"
                            opacity="0.7"
                          >
                            <animate attributeName="r" 
                              from="100" 
                              to="160" 
                              dur="1.5s" 
                              repeatCount="indefinite" />
                            <animate attributeName="opacity" 
                              from="0.7" 
                              to="0" 
                              dur="1.5s" 
                              repeatCount="indefinite" />
                          </circle>
                        )}
                        
                        {/* Main tag indicator */}
                        <g filter={selectedTag === tag.id ? `url(#glow-${tag.id})` : ''}>
                          {/* Tag background */}
                          <circle
                            cx="0"
                            cy="0"
                            r="60"
                            fill="rgba(20, 20, 30, 0.8)"
                            stroke={tag.color}
                            strokeWidth="4"
                            style={{ transition: 'all 0.3s ease-out' }}
                          />
                          
                          {/* Inner circle */}
                          <circle
                            cx="0"
                            cy="0"
                            r="32"
                            fill={tag.color}
                            opacity={selectedTag === tag.id ? "1" : "0.8"}
                            style={{ transition: 'opacity 0.3s ease-out' }}
                          />
                          
                          {/* Icon circle background */}
                          <circle
                            cx="0"
                            cy="0"
                            r="40"
                            fill="rgba(20, 20, 30, 0)"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            strokeDasharray={selectedTag === tag.id ? "0" : "6,6"}
                            style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
                          />
                          
                          {/* Tag Icon */}
                          <text 
                            x="0" 
                            y="0" 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            fontSize="40"
                            fill="white"
                            style={{ pointerEvents: 'none' }}
                          >
                            {tag.icon}
                          </text>
                        </g>
                      </g>
                      
                      {/* Connection lines to path (only for selected or hovered tag) */}
                      {(selectedTag === tag.id || (hoveredTag === tag.id && isInteractive)) && (
                        <>
                          <line 
                            x1="0" 
                            y1="0" 
                            x2={scalePosition(getClosestPointOnPath(tag).x, mapWidth) - scalePosition(tag.x, mapWidth)} 
                            y2={scalePosition(getClosestPointOnPath(tag).y, mapHeight) - scalePosition(tag.y, mapHeight)} 
                            stroke={tag.color} 
                            strokeWidth="4" 
                            strokeDasharray="10,10" 
                            opacity="0.6"
                          >
                            <animate attributeName="stroke-dashoffset" 
                              from="0" 
                              to="40" 
                              dur="1s" 
                              repeatCount="indefinite" />
                          </line>
                          
                          {/* Target destination marker */}
                          <circle 
                            cx={scalePosition(getClosestPointOnPath(tag).x, mapWidth) - scalePosition(tag.x, mapWidth)} 
                            cy={scalePosition(getClosestPointOnPath(tag).y, mapHeight) - scalePosition(tag.y, mapHeight)} 
                            r="16" 
                            fill={tag.color}
                            opacity="0.8"
                          />
                        </>
                      )}
                      
                      {/* Tag Label - Only show on hover or selected */}
                      {(selectedTag === tag.id || (hoveredTag === tag.id && isInteractive)) && (
                        <g>
                          {/* Label background with blurred edge */}
                          <rect 
                            x="-110" 
                            y="70" 
                            width="220" 
                            height="80" 
                            rx="16" 
                            ry="16"
                            fill="rgba(20, 20, 30, 0.85)"
                            stroke={tag.color}
                            strokeWidth="3"
                            filter={`url(#glow-${tag.id})`}
                          />
                          
                          {/* Title */}
                          <text 
                            x="0" 
                            y="105" 
                            textAnchor="middle" 
                            fill="white" 
                            fontSize="24"
                            fontWeight="bold"
                            style={{ pointerEvents: 'none' }}
                          >
                            {tag.id}
                          </text>
                          
                          {/* Subtitle */}
                          <text 
                            x="0" 
                            y="135" 
                            textAnchor="middle" 
                            fill="rgba(255,255,255,0.8)" 
                            fontSize="18"
                            style={{ pointerEvents: 'none' }}
                          >
                            {tag.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
                
                {/* Robot */}
                <g
                  transform={`translate(${robotPosition.x}, ${robotPosition.y}) rotate(${robotPosition.orientation})`}
                >
                  {/* Robot body */}
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="12" 
                    fill="rgba(147, 51, 234, 0.8)" 
                  />
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="12" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeDasharray="3 3"
                  >
                    <animate attributeName="r" from="12" to="20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Robot direction indicator */}
                  <line 
                    x1="0" 
                    y1="0" 
                    x2="0" 
                    y2="-15" 
                    stroke="white" 
                    strokeWidth="2" 
                  />
                  
                  {/* Line sensors visualization */}
                  <line 
                    x1="-8" 
                    y1="-10" 
                    x2="-8" 
                    y2="-15" 
                    stroke="rgba(255, 0, 0, 0.8)" 
                    strokeWidth="2" 
                  />
                  <line 
                    x1="0" 
                    y1="-10" 
                    x2="0" 
                    y2="-15" 
                    stroke="rgba(0, 255, 0, 0.8)" 
                    strokeWidth="2" 
                  />
                  <line 
                    x1="8" 
                    y1="-10" 
                    x2="8" 
                    y2="-15" 
                    stroke="rgba(0, 0, 255, 0.8)" 
                    strokeWidth="2" 
                  />
                  
                  {/* Wheels */}
                  <rect x="-12" y="-2" width="4" height="4" fill="rgba(255,255,255,0.5)" />
                  <rect x="8" y="-2" width="4" height="4" fill="rgba(255,255,255,0.5)" />
                  
                  {/* Package indicator (if carrying) */}
                  {data.hardware.sensors.packageDetector.status === "package_present" && (
                    <foreignObject x="-8" y="-8" width="16" height="16">
                      <div className="flex items-center justify-center h-full">
                        <Package size={12} className="text-white" />
                      </div>
                    </foreignObject>
                  )}
                </g>
                
                {/* Home position */}
                <g transform={`translate(${scalePosition(0, mapWidth)}, ${scalePosition(0, mapHeight)})`}>
                  <rect 
                    x="-25" 
                    y="-25" 
                    width="50" 
                    height="50" 
                    fill={missionState === 'returning' ? "rgba(0, 255, 0, 0.3)" : "black"} 
                    stroke={missionState === 'idle' ? "white" : "rgba(0, 255, 0, 0.8)"} 
                    strokeWidth={missionState === 'idle' ? "2" : "3"} 
                  />
                  <text 
                    x="0" 
                    y="30" 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="12"
                    fontWeight="bold"
                  >
                    HOME
                  </text>
                  <circle 
                    cx="0" 
                    cy="0" 
                    r={missionState === 'returning' ? "20" : "15"}
                    fill="none"
                    stroke="rgba(0, 255, 0, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className={missionState === 'returning' ? "animate-ping" : ""}
                  />
                </g>

                {/* Legend showing 150x150 total map and 120x120 robot path */}
                <g transform={`translate(${mapWidth - 200}, ${mapHeight - 80})`}>
                  <rect x="0" y="0" width="180" height="70" fill="rgba(0,0,0,0.7)" rx="5" />
                  <text x="10" y="20" fill="white" fontSize="12" fontWeight="bold">Map Legend:</text>
                  
                  <rect x="10" y="30" width="15" height="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="30" y="40" fill="white" fontSize="10">Map Boundary (150×150)</text>
                  
                  <rect x="10" y="50" width="15" height="10" fill="none" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="30" y="60" fill="white" fontSize="10">Robot Path (120×120)</text>
                </g>
              </svg>
            </motion.div>
          </div>
          
          {/* Mini map */}
          <div className="absolute bottom-4 left-4 w-[120px] h-[120px] bg-black/50 rounded-lg p-2 border border-white/20">
            <div className="text-white text-xs mb-1 flex justify-between items-center">
              <span>Overview</span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <svg width="100%" height="80%" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
              {/* Path outline */}
              <path 
                d={pathString} 
                stroke="white" 
                strokeWidth="2" 
                fill="none" 
              />
              
              {/* Robot position in mini map */}
              <circle 
                cx={robotPosition.x} 
                cy={robotPosition.y} 
                r="4" 
                fill="rgba(147, 51, 234, 1)" 
              />
              
              {/* RFID tags in mini map */}
              {rfidTags.map(tag => (
                <rect 
                  key={tag.id}
                  x={scalePosition(tag.x - tag.width/2, mapWidth)} 
                  y={scalePosition(tag.y - tag.height/2, mapHeight)} 
                  width={scalePosition(tag.width, mapWidth)} 
                  height={scalePosition(tag.height, mapHeight)} 
                  fill={tag.color} 
                  fillOpacity="0.5"
                />
              ))}
              
              {/* Viewport indicator */}
              <rect 
                x={mapWidth/2 - (mapWidth/(2*zoom))} 
                y={mapHeight/2 - (mapHeight/(2*zoom))} 
                width={mapWidth/zoom} 
                height={mapHeight/zoom} 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                strokeDasharray="5,5"
              />
              
              {/* Home position */}
              <rect
                x={scalePosition(45, mapWidth) - 5}
                y={scalePosition(25, mapHeight) - 5}
                width="10"
                height="10"
                fill="black"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </div>
          
          {/* Control panel */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black/70 p-3 rounded-lg border border-white/20 min-w-[180px]">
            <div className="text-white text-xs font-semibold mb-1">Controls</div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <motion.button
                  className="w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleAnimation}
                  title={isAnimating ? "Pause" : "Play"}
                >
                  {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                </motion.button>
                
                <motion.button
                  className="w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetAnimation}
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </motion.button>
                
                <motion.button
                  className="w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={increaseSpeed}
                  title="Increase Speed"
                >
                  <FastForward size={16} />
                </motion.button>
              </div>
              
              <div className="text-white text-xs">
                Progress: {Math.round(pathProgress * 100)}%
              </div>
            </div>
            
            <div className="h-px bg-white/20 my-1"></div>
            
            <div className="flex justify-between items-center">
              <div className="text-white text-xs">Zoom:</div>
              <div className="flex items-center gap-1">
                <motion.button
                  className="w-6 h-6 rounded-full bg-gray-600/80 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={decreaseZoom}
                >
                  <ZoomOut size={14} />
                </motion.button>
                <div className="text-white text-xs w-8 text-center">{zoom.toFixed(1)}x</div>
                <motion.button
                  className="w-6 h-6 rounded-full bg-gray-600/80 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={increaseZoom}
                >
                  <ZoomIn size={14} />
                </motion.button>
                <motion.button
                  className="w-6 h-6 rounded-full bg-gray-600/80 flex items-center justify-center text-white ml-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetZoom}
                >
                  <Home size={14} />
                </motion.button>
              </div>
            </div>
            
            <div className="h-px bg-white/20 my-1"></div>
            
            <div className="text-white text-xs">
              <div className="flex justify-between items-center mb-1">
                <span>Position:</span>
                <span className="font-mono">x: {Math.round(robotPosition.x/mapWidth * trackDimensions.width)}, y: {Math.round(robotPosition.y/mapHeight * trackDimensions.height)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Orientation:</span>
                <span>{robotPosition.orientation}°</span>
              </div>
            </div>
          </div>
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <motion.button 
              className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={increaseZoom}
            >
              <ZoomIn size={16} />
            </motion.button>
            <motion.button 
              className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={decreaseZoom}
            >
              <ZoomOut size={16} />
            </motion.button>
          </div>
          
          {/* Mission status display */}
          {missionState !== 'idle' && (
            <div className="absolute top-4 left-4 bg-black/70 p-3 rounded-lg border border-white/20 text-white">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium capitalize">Mission: {missionState}</span>
              </div>
              
              {selectedTag && (
                <div className="mt-2 text-xs text-white/70">
                  <span>Target: </span>
                  <span className="font-semibold" style={{ color: rfidTags.find(t => t.id === selectedTag)?.color || 'white' }}>
                    {selectedTag}
                  </span>
                </div>
              )}
              
              <div className="mt-2 text-xs">
                <span className="text-white/70">Progress: </span>
                <span>{Math.round(pathProgress * 100)}%</span>
              </div>
              
              {missionState === 'delivering' && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-xs text-yellow-400">Delivering package...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 