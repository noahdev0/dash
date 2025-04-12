'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react';

export const ManualControl: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState('Disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:8000', {
      // withCredentials: true,
      retries: 5,
      timeout: 2000,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      setStatus('Connected');
      setIsConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      setStatus('Disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('error', (err: Error) => {
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendCommand = (command: string) => {
    if (socketRef.current && isConnected) {
      try {
        socketRef.current.emit('message', command);
        setActiveCommand(command);
        
        // Update status text
        switch(command) {
          case 'F': setStatus('Moving Forward'); break;
          case 'B': setStatus('Moving Backward'); break;
          case 'L': setStatus('Turning Left'); break;
          case 'R': setStatus('Turning Right'); break;
          case 'S': setStatus('Stopped'); break;
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to send command: ${err.message}`);
        } else {
          setError('Failed to send command');
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isConnected) return;

    switch(e.key) {
      case 'ArrowUp': sendCommand('F'); break;
      case 'ArrowDown': sendCommand('B'); break;
      case 'ArrowLeft': sendCommand('L'); break;
      case 'ArrowRight': sendCommand('R'); break;
      case ' ': sendCommand('S'); break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!isConnected) return;

    switch(e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        sendCommand('S');
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isConnected]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Robot Manual Control</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-6">
            <span className="font-semibold">Connection Status: </span>
            <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
              {status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div></div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={activeCommand === 'F' ? 'default' : 'outline'}
                className="w-full aspect-square"
                onMouseDown={() => sendCommand('F')}
                onMouseUp={() => sendCommand('S')}
                onTouchStart={() => sendCommand('F')}
                onTouchEnd={() => sendCommand('S')}
              >
                <ArrowUp className="h-6 w-6" />
              </Button>
            </motion.div>
            <div></div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={activeCommand === 'L' ? 'default' : 'outline'}
                className="w-full aspect-square"
                onMouseDown={() => sendCommand('L')}
                onMouseUp={() => sendCommand('S')}
                onTouchStart={() => sendCommand('L')}
                onTouchEnd={() => sendCommand('S')}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={activeCommand === 'S' ? 'destructive' : 'outline'}
                className="w-full aspect-square"
                onClick={() => sendCommand('S')}
              >
                <Square className="h-6 w-6" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={activeCommand === 'R' ? 'default' : 'outline'}
                className="w-full aspect-square"
                onMouseDown={() => sendCommand('R')}
                onMouseUp={() => sendCommand('S')}
                onTouchStart={() => sendCommand('R')}
                onTouchEnd={() => sendCommand('S')}
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            </motion.div>
            <div></div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={activeCommand === 'B' ? 'default' : 'outline'}
                className="w-full aspect-square"
                onMouseDown={() => sendCommand('B')}
                onMouseUp={() => sendCommand('S')}
                onTouchStart={() => sendCommand('B')}
                onTouchEnd={() => sendCommand('S')}
              >
                <ArrowDown className="h-6 w-6" />
              </Button>
            </motion.div>
            <div></div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>↑ Arrow: Move Forward</li>
                <li>↓ Arrow: Move Backward</li>
                <li>← Arrow: Turn Left</li>
                <li>→ Arrow: Turn Right</li>
                <li>Space: Stop</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}; 