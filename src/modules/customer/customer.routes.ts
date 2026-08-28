import { Router } from "express";
import { CustomerController } from "./customer.controller";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
const customerRoutes = (
  customerController: CustomerController,
  jwtService: Jwt,
): Router => {
  const routes = Router();
  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), customerController.create);
  routes.patch("/:customer_id", AuthMiddleware(jwtService, ["ADMIN"]), customerController.update)
  routes.get("/:customer_id", AuthMiddleware(jwtService), customerController.findById)
  routes.delete("/:customer_id", AuthMiddleware(jwtService, ["ADMIN"]), customerController.delete)
  routes.patch("/:customer_id/restore", AuthMiddleware(jwtService, ["ADMIN"]), customerController.restore)
  routes.get("/", AuthMiddleware(jwtService), customerController.getCustomers)


  return routes;
};

export default customerRoutes;
