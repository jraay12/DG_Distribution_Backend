import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { ActivityController } from "./activity.controller";

const activityRoutes = (controller: ActivityController, jwt: Jwt): Router => {
  const routes = Router();
  routes.post("/location", AuthMiddleware(jwt, ["USER"]), controller.recordLocation);
  routes.get("/locations", AuthMiddleware(jwt, ["ADMIN"]), controller.getLocations);
  routes.get("/agents", AuthMiddleware(jwt, ["ADMIN"]), controller.getActivities);
  return routes;
};
export default activityRoutes;
