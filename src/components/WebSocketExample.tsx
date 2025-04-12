import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketExample: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const { sendMessage, addMessageHandler, isConnected } = useWebSocket('ws://localhost:3001');

    useEffect(() => {
        // Add handler for 'message' type messages
        addMessageHandler('message', (data) => {
            setMessages(prev => [...prev, data]);
        });
    }, [addMessageHandler]);

    const handleSendMessage = () => {
        sendMessage('message', 'Hello from client!');
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}</h2>
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Send Message
                </button>
            </div>
            <div className="border p-4 rounded">
                <h3 className="font-bold mb-2">Messages:</h3>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index} className="mb-1">{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WebSocketExample; 