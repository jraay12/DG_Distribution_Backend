import { getIO } from "./socket.server"

export const emitProductStats = (data: any) => {
  getIO().emit("stats:update", data)
}

export const emitAddStock = (data: any) => {
  getIO().emit("product:add", data)
}

export const emitProductInventory = (data: {product_id: string, quantity: number}) => {
  getIO().to("stocks").emit("product:inventory", data)
}