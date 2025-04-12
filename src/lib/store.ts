import { writable } from 'svelte/store';
import { RobotData } from './types';
import { websocketService } from './websocket';

// Create a writable store with initial empty state
const createRobotDataStore = () => {
  const { subscribe, set, update } = writable<RobotData | null>(null);

  // Subscribe to WebSocket updates
  websocketService.subscribe((data) => {
    set(data);
  });

  // Function to send updates to the server
  const sendUpdate = (data: RobotData) => {
    websocketService.sendUpdate(data);
  };

  return {
    subscribe,
    sendUpdate
  };
};

export const robotDataStore = createRobotDataStore(); 