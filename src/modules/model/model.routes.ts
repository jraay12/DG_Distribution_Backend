import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { ModelController } from "./model.controller";
const modelRoutes = (modelController: ModelController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), modelController.create)
  routes.patch("/:model_id", AuthMiddleware(jwtService, ["ADMIN"]), modelController.update)
  routes.get("/", AuthMiddleware(jwtService), modelController.getActiveModel)
  return routes;
};

export default modelRoutes;
