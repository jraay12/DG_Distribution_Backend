import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { DailyReportController } from "./daily-report.controller";

const dailyReportRoutes = (controller: DailyReportController, jwt: Jwt): Router => {
  const routes = Router();
  routes.post("/", AuthMiddleware(jwt, ["USER"]), controller.submit);
  routes.get("/mine", AuthMiddleware(jwt, ["USER"]), controller.getMine);
  routes.get("/", AuthMiddleware(jwt, ["ADMIN"]), controller.getAll);
  routes.patch("/:id/review", AuthMiddleware(jwt, ["ADMIN"]), controller.review);
  return routes;
};

export default dailyReportRoutes;
