import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { PromoCodeController } from "./promo.controller";

const promoCodeRoutes = (
  promoCodeController: PromoCodeController,
  jwtService: Jwt,
): Router => {
  const routes = Router();

  routes.post(
    "/",
    AuthMiddleware(jwtService, ["ADMIN"]),
    promoCodeController.create,
  );
  routes.patch(
    "/:id/disabled",
    AuthMiddleware(jwtService, ["ADMIN"]),
    promoCodeController.disabled,
  );
  routes.patch(
    "/:id/enabled",
    AuthMiddleware(jwtService, ["ADMIN"]),
    promoCodeController.enabled,
  );

  return routes;
};

export default promoCodeRoutes;
