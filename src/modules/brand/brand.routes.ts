import { Router } from "express";
import { BrandController } from "./brand.controller";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
const brandRoutes = (brandController: BrandController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/create", AuthMiddleware(jwtService, ["ADMIN"]), brandController.create)
  routes.delete("/:brand_id", AuthMiddleware(jwtService, ["ADMIN"]), brandController.delete)
  routes.patch("/:brand_id/restore", AuthMiddleware(jwtService, ["ADMIN"]), brandController.restore)
  routes.get("/", AuthMiddleware(jwtService), brandController.getBrand)
  routes.patch("/:brand_id", AuthMiddleware(jwtService, ["ADMIN"]), brandController.updateName)
  routes.get("/:brand_id", AuthMiddleware(jwtService), brandController.findById)
  return routes;
};

export default brandRoutes;
