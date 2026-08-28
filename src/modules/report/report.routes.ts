import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { ReportController } from "./report.controller";

const reportRoutes = (controller: ReportController, jwt: Jwt): Router => {
  const routes = Router();
  routes.get("/sales", AuthMiddleware(jwt, ["ADMIN"]), controller.sales);
  routes.get("/inventory", AuthMiddleware(jwt, ["ADMIN"]), controller.inventory);
  routes.get("/agents", AuthMiddleware(jwt, ["ADMIN"]), controller.agents);
  return routes;
};
export default reportRoutes;
