import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { ModelController } from "./model.controller";
const modelRoutes = (modelController: ModelController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), modelController.create)
  
  return routes;
};

export default modelRoutes;
