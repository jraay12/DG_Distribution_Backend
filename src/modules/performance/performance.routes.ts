import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { PerformanceController } from "./performance.controller";

export default function performanceRoutes(controller: PerformanceController, jwt: Jwt): Router {
  const routes = Router();
  routes.get("/mine", AuthMiddleware(jwt, ["USER"]), controller.mine);
  routes.put("/targets", AuthMiddleware(jwt, ["ADMIN"]), controller.setTarget);
  return routes;
}
