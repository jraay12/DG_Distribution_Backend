import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { QuotaController } from "./quota.controller";

const quotaRoutes = (controller: QuotaController, jwt: Jwt): Router => {
  const routes = Router();
  routes.post("/", AuthMiddleware(jwt, ["ADMIN"]), controller.setQuota);
  routes.get("/mine", AuthMiddleware(jwt, ["USER"]), controller.mine);
  routes.get("/user/:user_id", AuthMiddleware(jwt, ["ADMIN"]), controller.byUser);
  routes.get("/", AuthMiddleware(jwt, ["ADMIN"]), controller.all);
  return routes;
};
export default quotaRoutes;
