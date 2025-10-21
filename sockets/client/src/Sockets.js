import { io } from "socket.io-client"

const socket = io("http://localhost:4000", {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 1000
})

export default socket;