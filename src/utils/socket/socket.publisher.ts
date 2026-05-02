import { getIO } from "./socket.server"

export const emitProductStats = (data: any) => {
  getIO().emit("stats:update", data)
}

export const emitAddStock = (data: any) => {
  getIO().emit("product:add", data)
}