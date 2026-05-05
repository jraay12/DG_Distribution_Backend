import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { TransactionController } from "./transaction.controller";

const transactionRoutes = (
  transactionController: TransactionController,
  jwtService: Jwt
): Router => {
  const routes = Router();


  routes.post(
    "/",
    AuthMiddleware(jwtService, ["USER"]),
    transactionController.create
  );


  routes.get(
    "/:id",
    AuthMiddleware(jwtService, ["ADMIN", "USER"]),
    transactionController.getById
  );


  routes.get(
    "/store-visit/:store_visit_id",
    AuthMiddleware(jwtService, ["ADMIN", "USER"]),
    transactionController.getByStoreVisit
  );

  return routes;
};

export default transactionRoutes;