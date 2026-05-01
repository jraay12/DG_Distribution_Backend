import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { StoreVisitController } from "./store-visit.controller";

const storeVisitRoutes = (
  storeVisitController: StoreVisitController,
  jwtService: Jwt,
): Router => {
  const routes = Router();

  routes.post(
    "/",
    AuthMiddleware(jwtService, ["ADMIN"]),
    storeVisitController.create,
  );

  routes.get(
    "/:user_id/previous-route",
    AuthMiddleware(jwtService, ["ADMIN"]),
    storeVisitController.previousRoutesAssigned,
  );

  routes.post(
    "/:user_id/previous-assign",
    AuthMiddleware(jwtService, ["ADMIN"]),
    storeVisitController.assignPreviousRoutes,
  );


  
  return routes;
};

export default storeVisitRoutes;
