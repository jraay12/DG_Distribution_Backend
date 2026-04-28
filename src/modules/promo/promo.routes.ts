import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { PromoCodeController } from "./promo.controller";

const promoCodeRoutes = (promoCodeController: PromoCodeController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), promoCodeController.create)

  return routes;
};

export default promoCodeRoutes;
