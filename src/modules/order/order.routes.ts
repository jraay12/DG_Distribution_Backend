import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { OrderController } from "./order.controller";

export default function orderRoutes(controller: OrderController, jwt: Jwt): Router {
  const routes = Router();
  routes.get("/", AuthMiddleware(jwt, ["ADMIN"]), controller.list);
  routes.put("/store-visit/:store_visit_id", AuthMiddleware(jwt, ["USER"]), controller.submit);
  routes.get("/store-visit/:store_visit_id", AuthMiddleware(jwt), controller.getByVisit);
  return routes;
}
