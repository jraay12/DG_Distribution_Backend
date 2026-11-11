import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { CategoryController } from "./category.controller";

export default function categoryRoutes(controller: CategoryController, jwt: Jwt): Router {
  const routes = Router();
  routes.get("/", AuthMiddleware(jwt), controller.list);
  routes.post("/", AuthMiddleware(jwt, ["ADMIN"]), controller.create);
  routes.patch("/:id", AuthMiddleware(jwt, ["ADMIN"]), controller.update);
  return routes;
}
