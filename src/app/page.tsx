import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  // Robot system status information
  const robotStatus = {
    hardware: {
      engines: {
        leftMotor: {
          status: "normal",
          temperature: 0,
          efficiency: 0,
          rpm: 0,
        },
        rightMotor: {
          status: "normal",
          temperature: 0,
          efficiency: 0,
          rpm: 0,
        },
      },
      sensors: {
        lineDetector: {
          status: "normal",
          accuracy: 97,
          lastCalibration: "2023-10-25",
        },
        rfidReader: {
          status: "normal",
          signalStrength: 88,
          detectionRange: 10,
          lastScan: new Date(Date.now() - 300000).toISOString(),
        },
        proximityFront: { status: "normal", distance: 120 },
        proximityRear: { status: "normal", distance: 150 },
        packageDetector: {
          status: "package_present",
          weightKg: 1.25,
          value: 95,
        },
        irSensors: {
          left: { value: 50, threshold: 70, state: "off_line" },
          center: { value: 90, threshold: 70, state: "on_line" },
          right: { value: 45, threshold: 70, state: "off_line" },
        },
      },
      battery: {
        level: 82,
        temperature: 38,
        timeRemaining: 240,
        cycles: 125,
        voltage: 11.8,
      },
      motorLeft: {
        speed: 0,
        direction: "forward",
        currentDraw: 0.2,
        temperature: 25,
        status: "idle",
      },
      motorRight: {
        speed: 0,
        direction: "forward",
        currentDraw: 0.2,
        temperature: 25,
        status: "idle",
      },
      servoDeployer: {
        position: 0,
        status: "idle",
      },
    },
    system: {
      status: "active",
      mode: "automatic",
      battery: {
        level: 85,
        voltage: 12.6,
        charging: false,
        estimatedRuntime: 180,
        temperature: 38,
        timeRemaining: 240,
        cycles: 125,
      },
      errors: [],
      warnings: [],
      cpu: { usage: 32, temperature: 45 },
      memory: { used: 128, total: 512, usage: 25 },
      storage: { used: 2.4, total: 8, usage: 30 },
      connectivity: {
        wifi: {
          connected: true,
          signalStrength: 75,
          network: "RobotNet",
          ssid: "Robot_Network",
          ipAddress: "192.168.1.120",
        },
        bluetooth: { connected: false, status: "disabled" },
        lastHeartbeat: new Date().toISOString(),
        latency: 12,
      },
      uptime: 14520, // in seconds
    },
    navigation: {
      currentState: "following_line",
      speed: 0.5, // meters per second
      orientation: 90, // degrees
      position: { x: 45, y: 25 },
      currentRoute: "home_to_station1",
      pathCompletion: 67, // percentage
      states: [
        "idle",
        "scanning",
        "moving",
        "delivering",
        "returning",
        "following_line",
      ],
      lineFollowing: {
        speed: "normal",
        pidController: {
          proportional: 1.2,
          integral: 0.01,
          derivative: 0.8,
          lastError: 0,
          setpoint: 0,
        },
        position: {
          x: 45,
          y: 25,
          orientation: 90,
        },
      },
      path: {
        totalLength: 100,
        completed: 67,
        percentComplete: 67,
        estimatedTimeRemaining: 30,
      },
    },
    mission: {
      current: {
        id: "M2023-15",
        status: "in_progress",
        startTime: "2023-10-30T14:25:30",
        estimatedCompletionTime: "2023-10-30T14:35:30",
        package: {
          id: "PKG-237",
          destination: "TAG2",
          priority: "normal",
          weight: 1.25,
          dimensions: { width: 15, height: 10, depth: 10 },
        },
        route: [],
      },
      history: [],
      stats: {
        completed: 157,
        failed: 3,
        totalDistance: 423, // kilometers
      },
    },
    commands: {
      available: ["scan_tag", "deliver_package", "pause", "resume"],
      lastCommand: {
        type: "",
        timestamp: "",
        source: "",
        status: "",
      },
      manualControl: {
        enabled: false,
        leftMotor: 0,
        rightMotor: 0,
        deployPackage: false,
      },
    },
    analytics: {
      packagesDelivered: {
        today: 0,
        thisWeek: 5,
        total: 124,
      },
      distanceTraveled: {
        today: 0,
        thisWeek: 350,
        total: 12500,
      },
      efficiency: {
        averageDeliveryTime: 180,
        successRate: 98.5,
        batteryUsagePerDelivery: 5.2,
      },
      errors: {
        lineFollowingLost: 2,
        rfidReadFailures: 1,
        packageDetectionFailures: 0,
        deploymentFailures: 0,
      },
    },
  };

  return <Dashboard initialStatus={robotStatus} />;
}
