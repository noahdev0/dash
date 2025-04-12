import { RobotData } from './types';

// This is a simplified version of the mock data
export const mockData: RobotData = {
  system: {
    status: 'active',
    mode: 'automatic',
    battery: {
      level: 85,
      voltage: 12.6,
      charging: false,
      estimatedRuntime: 180
    },
    connectivity: {
      wifi: {
        connected: true,
        ssid: 'Robot_Network',
        signalStrength: 87,
        ipAddress: '192.168.1.120'
      },
      lastHeartbeat: new Date().toISOString(),
      latency: 12
    },
    errors: [],
    warnings: [],
    uptime: 3600
  },
  hardware: {
    motorLeft: {
      speed: 0,
      direction: 'forward',
      currentDraw: 0.2,
      temperature: 25,
      status: 'idle'
    },
    motorRight: {
      speed: 0,
      direction: 'forward',
      currentDraw: 0.2,
      temperature: 25,
      status: 'idle'
    },
    servoDeployer: {
      position: 0,
      status: 'idle'
    },
    sensors: {
      irSensors: {
        left: {
          value: 50,
          threshold: 70,
          state: 'off_line'
        },
        center: {
          value: 90,
          threshold: 70,
          state: 'on_line'
        },
        right: {
          value: 45,
          threshold: 70,
          state: 'off_line'
        }
      },
      rfidReader: {
        status: 'idle',
        lastScan: new Date(Date.now() - 300000).toISOString(),
        signalStrength: 0
      },
      packageDetector: {
        value: 5,
        status: 'no_package_present'
      }
    }
  },
  navigation: {
    currentState: 'idle',
    states: ['idle', 'scanning', 'moving', 'delivering', 'returning'],
    lineFollowing: {
      speed: 'normal',
      pidController: {
        proportional: 1.2,
        integral: 0.01,
        derivative: 0.8,
        lastError: 0,
        setpoint: 0
      },
      position: {
        x: 0,
        y: 0,
        orientation: 0
      }
    },
    path: {
      totalLength: 100,
      completed: 0,
      percentComplete: 0,
      estimatedTimeRemaining: 0
    }
  },
  mission: {
    status: 'idle',
    current: {
      id: '',
      startTime: '',
      estimatedCompletionTime: '',
      package: {
        id: '',
        rfidTag: '',
        weight: 0,
        destination: '',
        priority: 'normal'
      },
      route: []
    },
    history: []
  },
  environment: {
    shelves: [],
    obstacles: [],
    loadingStation: {
      status: 'idle',
      packagesQueued: 0,
      location: {
        x: 0,
        y: 0
      }
    }
  },
  commands: {
    available: ['pause', 'resume', 'deliver_package', 'scan_tag'],
    lastCommand: {
      type: '',
      timestamp: '',
      source: '',
      status: ''
    },
    manualControl: {
      enabled: false,
      leftMotor: 0,
      rightMotor: 0,
      deployPackage: false
    }
  },
  analytics: {
    packagesDelivered: {
      today: 0,
      thisWeek: 5,
      total: 124
    },
    distanceTraveled: {
      today: 0,
      thisWeek: 350,
      total: 12500
    },
    efficiency: {
      averageDeliveryTime: 180,
      successRate: 98.5,
      batteryUsagePerDelivery: 5.2
    },
    errors: {
      lineFollowingLost: 2,
      rfidReadFailures: 1,
      packageDetectionFailures: 0,
      deploymentFailures: 0
    }
  },
  eventLog: [],
  settings: {
    lineFollowing: {
      baseSpeed: 70,
      turnSpeed: 40,
      slowSpeed: 30,
      sensorThreshold: 50
    },
    rfid: {
      scanInterval: 500,
      requiredSignalStrength: 60
    },
    packageDeployment: {
      deploymentDuration: 1500,
      confirmationRequired: true
    },
    systemPreferences: {
      autoReturnWhenIdle: true,
      lowBatteryThreshold: 20,
      criticalBatteryThreshold: 10,
      telemetryInterval: 1000
    }
  },
  maintenance: {
    lastMaintenance: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    nextScheduledMaintenance: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    motorLeftRuntime: 12500,
    motorRightRuntime: 12400,
    firmwareVersion: '1.2.3',
    availableUpdate: null,

  }
}; 