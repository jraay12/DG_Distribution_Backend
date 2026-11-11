import { Router } from "express"
import { InventoryController } from "./inventory.controller"
import { AuthMiddleware } from "../../utils/middleware/authMiddleware"
import { Jwt } from "../../utils/jwt"

const inventoryRoutes = (inventoryController: InventoryController, jwtService: Jwt): Router => {
  const routes = Router()

  routes.get("/lookup", AuthMiddleware(jwtService, ["ADMIN"]), inventoryController.lookup)
  routes.patch("/:product_id/identifiers", AuthMiddleware(jwtService, ["ADMIN"]), inventoryController.updateIdentifiers)
  routes.patch("/:product_id/stock/add", AuthMiddleware(jwtService, ["ADMIN"]), inventoryController.addStock)
  routes.patch("/:product_id/stock/deduct", AuthMiddleware(jwtService, ["ADMIN"]), inventoryController.deductStock)
  routes.patch("/:product_id/reorder-level", AuthMiddleware(jwtService, ["ADMIN"]), inventoryController.updateReorderLevel)
  return routes

}

export default inventoryRoutes