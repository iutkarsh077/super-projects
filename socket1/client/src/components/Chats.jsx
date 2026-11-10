"use client";
import socket from "@/libs/sockets";
import { useEffect, useRef, useState } from "react";

const ChatApp = () => {
    const socketId = useRef(null);
    const [isConnected, setIsConnected] = useState(false);


    useEffect(() => {
        if(socketId.current) return;
        const handleConnect = () => {
            console.log("connected: ", socket);
            setIsConnected(true);
            socketId.current = socket.id;
        }

        const handleDisconnect = (data) => {
            setIsConnected(false);
            socketId.current = null;
            console.log("disconnected")
        }

        socket.on("server-message", (data)=>{
            console.log(data)
        })
        
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.connect();

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.disconnect();
            console.log("Cleanup executed");
        };
    }, [])

    const handleSendMessage = () => {
        socket.emit("message", "Hello from client");
    }
    return (
        <div>
            This is a app
            <div onClick={handleSendMessage}>Is connected: {isConnected ? "Yes connected": "Not connected"}</div>
        </div>
    )
}

export default ChatApp;