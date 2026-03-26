import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { UnAuthorizedError } from "../error/UnAuthorizedError";
import { jwt } from "../../container";

let io: Server;


export const socketInit = (server: HttpServer) => {

 io = new Server(server, {
  cors: {
      origin: "http://localhost:5174",
      credentials: true,
    },
 })

 io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token || socket.handshake.headers.authorization


  if (!token) return next(new UnAuthorizedError('Authentication error'));

  try {
    const user = jwt.verifyAccessToken(token)
    socket.data.user = user;
    next();
  } catch (error) {
    next(new UnAuthorizedError('Authentication error'));
  }  
 })

 io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
}

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};