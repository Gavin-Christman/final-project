import { WebSocket } from "ws"

// Esablish connection to Server
const ws = new WebSocket("ws://localhost:8080")

ws.onopen = () => {
    ws.send("This is a message")
}

ws.onerror = (err) => {
    console.log(err)
}

ws.onclose = () => {
    console.log("Connection has closed")
}