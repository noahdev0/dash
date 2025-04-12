"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RobotData } from '../lib/types';

interface WebSocketContextType {
  robotData: RobotData | null;
  sendUpdate: (data: RobotData) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  robotData: null,
  sendUpdate: () => {},
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [robotData, setRobotData] = useState<RobotData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const websocket = new WebSocket('http://localhost:8000');

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RobotData;
          setRobotData(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 1 second
        setTimeout(connect, 1000);
      };

      websocket.onerror = (error) => {
        // console.error('WebSocket error:', error);
      };

      setWs(websocket);
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendUpdate = (data: RobotData) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        payload: data
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <WebSocketContext.Provider value={{ robotData, sendUpdate, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 