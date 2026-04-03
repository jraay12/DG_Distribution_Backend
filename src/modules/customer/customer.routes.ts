import { Router } from "express";
import { CustomerController } from "./customer.controller";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
const customerRoutes = (
  customerController: CustomerController,
  jwtService: Jwt,
): Router => {
  const routes = Router();
  routes.post("/", AuthMiddleware(jwtService), customerController.create);
  routes.patch("/:customer_id", AuthMiddleware(jwtService), customerController.update)
  return routes;
};

export default customerRoutes;
