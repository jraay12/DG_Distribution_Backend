import { Router } from "express"
import { InventoryController } from "./inventory.controller"
import { AuthMiddleware } from "../../utils/middleware/authMiddleware"
import { Jwt } from "../../utils/jwt"

const inventoryRoutes = (inventoryController: InventoryController, jwtService: Jwt): Router => {
  const routes = Router()

  routes.patch("/:product_id", AuthMiddleware(jwtService, ["ADMIN"]), inventoryController.addStock)

  return routes

}

export default inventoryRoutes