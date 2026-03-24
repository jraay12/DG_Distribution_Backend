import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { ModelController } from "./model.controller";
const modelRoutes = (modelController: ModelController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), modelController.create)
  routes.patch("/:model_id", AuthMiddleware(jwtService, ["ADMIN"]), modelController.update)
  routes.get("/", AuthMiddleware(jwtService), modelController.getActiveModel)
  routes.delete("/:model_id", AuthMiddleware(jwtService, ["ADMIN"]), modelController.softDelete)
  routes.patch("/:model_id/restore", AuthMiddleware(jwtService, ["ADMIN"]), modelController.restore)
  routes.get("/:model_id", AuthMiddleware(jwtService), modelController.findByIdWithBrand)

  return routes;
};

export default modelRoutes;
