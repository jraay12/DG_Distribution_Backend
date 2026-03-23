import { Router } from "express";
import { BrandController } from "./brand.controller";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
const brandRoutes = (brandController: BrandController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/create", AuthMiddleware(jwtService), brandController.create)
  
  return routes;
};

export default brandRoutes;
