export interface RobotData {
  system: {
    status: string;
    mode: string;
    battery: {
      level: number;
      voltage: number;
      charging: boolean;
      estimatedRuntime: number;
      temperature?: number;
      timeRemaining?: number;
      cycles?: number;
    };
    connectivity: {
      wifi: {
        connected: boolean;
        ssid: string;
        signalStrength: number;
        ipAddress: string;
        network?: string;
      };
      lastHeartbeat: string;
      latency: number;
      bluetooth?: {
        connected: boolean;
        status: string;
      };
    };
    errors: string[];
    warnings: string[];
    uptime: number;
    cpu?: {
      usage: number;
      temperature: number;
    };
    memory?: {
      used: number;
      total: number;
      usage: number;
    };
    storage?: {
      used: number;
      total: number;
      usage: number;
    };
  };
  hardware: {
    motorLeft: {
      speed: number;
      direction: string;
      currentDraw: number;
      temperature: number;
      status: string;
    };
    motorRight: {
      speed: number;
      direction: string;
      currentDraw: number;
      temperature: number;
      status: string;
    };
    engines?: {
      leftMotor: {
        status: string;
        temperature: number;
        efficiency: number;
        rpm: number;
      };
      rightMotor: {
        status: string;
        temperature: number;
        efficiency: number;
        rpm: number;
      };
    };
    servoDeployer: {
      position: number;
      status: string;
    };
    sensors: {
      irSensors: {
        left: {
          value: number;
          threshold: number;
          state: string;
        };
        center: {
          value: number;
          threshold: number;
          state: string;
        };
        right: {
          value: number;
          threshold: number;
          state: string;
        };
      };
      rfidReader: {
        status: string;
        lastScan: string;
        signalStrength: number;
      };
      packageDetector: {
        value: number;
        status: string;
        weightKg?: number;
      };
      lineDetector?: {
        status: string;
        accuracy: number;
        lastCalibration: string;
      };
      proximityFront?: {
        status: string;
        distance: number;
      };
      proximityRear?: {
        status: string;
        distance: number;
      };
    };
    battery?: {
      level: number;
      temperature: number;
      timeRemaining: number;
      cycles: number;
      voltage: number;
    };
  };
  navigation: {
    currentState: string;
    states: string[];
    speed?: number;
    orientation?: number;
    position?: {
      x: number;
      y: number;
    };
    pathCompletion?: number;
    currentRoute?: string;
    lineFollowing: {
      speed: string;
      pidController: {
        proportional: number;
        integral: number;
        derivative: number;
        lastError: number;
        setpoint: number;
      };
      position: {
        x: number;
        y: number;
        orientation: number;
      };
    };
    path: {
      totalLength: number;
      completed: number;
      percentComplete: number;
      estimatedTimeRemaining: number;
    };
  };
  mission: {
    status?: string;
    current: {
      id: string;
      startTime: string;
      estimatedCompletionTime?: string;
      package: {
        id: string;
        rfidTag?: string;
        weight: number;
        destination: string;
        priority: string;
        dimensions?: {
          width: number;
          height: number;
          depth: number;
        };
      };
      route: any[];
    };
    history: any[];
    stats?: {
      completed: number;
      failed: number;
      totalDistance: number;
    };
  };
  environment?: {
    shelves: any[];
    obstacles: any[];
    loadingStation: {
      status: string;
      packagesQueued: number;
      location: {
        x: number;
        y: number;
      };
    };
  };
  commands: {
    available: string[];
    lastCommand: {
      type: string;
      timestamp: string;
      source: string;
      status: string;
    };
    manualControl: {
      enabled: boolean;
      leftMotor: number;
      rightMotor: number;
      deployPackage: boolean;
    };
  };
  analytics: {
    packagesDelivered: {
      today: number;
      thisWeek: number;
      total: number;
    };
    distanceTraveled: {
      today: number;
      thisWeek: number;
      total: number;
    };
    efficiency: {
      averageDeliveryTime: number;
      successRate: number;
      batteryUsagePerDelivery: number;
    };
    errors: {
      lineFollowingLost: number;
      rfidReadFailures: number;
      packageDetectionFailures: number;
      deploymentFailures: number;
    };
  };
  eventLog?: any[];
  settings?: {
    lineFollowing: {
      baseSpeed: number;
      turnSpeed: number;
      slowSpeed: number;
      sensorThreshold: number;
    };
    rfid: {
      scanInterval: number;
      requiredSignalStrength: number;
    };
    packageDeployment: {
      deploymentDuration: number;
      confirmationRequired: boolean;
    };
    systemPreferences: {
      autoReturnWhenIdle: boolean;
      lowBatteryThreshold: number;
      criticalBatteryThreshold: number;
      telemetryInterval: number;
    };
  };
  maintenance?: {
    lastMaintenance: string;
    nextScheduledMaintenance: string;
    motorLeftRuntime: number;
    motorRightRuntime: number;
    firmwareVersion: string;
    availableUpdate: any;
  };
} 