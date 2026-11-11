import { Router } from "express"
import { StoreInventoryController } from "./store-inventory.controller"
import { AuthMiddleware } from "../../utils/middleware/authMiddleware"
import { Jwt } from "../../utils/jwt"

const storeInventoryRoutes = (storeInventoryController: StoreInventoryController, jwtService: Jwt): Router => {
  const routes = Router()

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), storeInventoryController.create)
  routes.patch("/:customer_id/:product_id/stock", AuthMiddleware(jwtService, ["USER", "ADMIN"]), storeInventoryController.adjustStock)
  routes.put("/:customer_id/visit-count", AuthMiddleware(jwtService, ["USER"]), storeInventoryController.submitVisitCount)
  routes.get("/:customer_id/visit-count", AuthMiddleware(jwtService, ["USER", "ADMIN"]), storeInventoryController.getVisitCount)
  routes.get("/:customer_id", AuthMiddleware(jwtService, ["USER", "ADMIN"]), storeInventoryController.getStoreInventories)
  routes.get("/:customer_id/recommendation", AuthMiddleware(jwtService, ["USER", "ADMIN"]), storeInventoryController.getProductRecommendation)


  return routes

}

export default storeInventoryRoutes
