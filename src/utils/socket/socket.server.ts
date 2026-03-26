import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;


export const socketInit = (server: HttpServer) => {
 io = new Server(server, {
  cors: {
      origin: "http://localhost:5174",
      credentials: true,
    },
 })

 io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
}

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};