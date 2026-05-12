import { Router } from "express"
import { StoreInventoryController } from "./store-inventory.controller"
import { AuthMiddleware } from "../../utils/middleware/authMiddleware"
import { Jwt } from "../../utils/jwt"

const storeInventoryRoutes = (storeInventoryController: StoreInventoryController, jwtService: Jwt): Router => {
  const routes = Router()

  routes.post("/", AuthMiddleware(jwtService, ["USER"]), storeInventoryController.create)
  routes.get("/:customer_id", AuthMiddleware(jwtService, ["USER", "ADMIN"]), storeInventoryController.getStoreInventories)
  routes.get("/:customer_id/recommendation", AuthMiddleware(jwtService, ["USER", "ADMIN"]), storeInventoryController.getProductRecommendation)


  return routes

}

export default storeInventoryRoutes