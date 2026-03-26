import { getIO } from "./socket.server"

export const emitProductStats = (data: any) => {
  getIO().emit("stats:update", data)
}