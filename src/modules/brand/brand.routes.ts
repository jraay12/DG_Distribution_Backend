import { Router } from "express";
import { BrandController } from "./brand.controller";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
const brandRoutes = (brandController: BrandController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/create", AuthMiddleware(jwtService), brandController.create)
  routes.delete("/:brand_id", AuthMiddleware(jwtService), brandController.delete)
  routes.patch("/:brand_id/restore", AuthMiddleware(jwtService), brandController.restore)
  routes.get("/", AuthMiddleware(jwtService), brandController.getAllBrand)
  routes.patch("/:brand_id", AuthMiddleware(jwtService), brandController.updateName)
  routes.get("/:brand_id", AuthMiddleware(jwtService), brandController.findById)
  return routes;
};

export default brandRoutes;
