import { Router } from "express";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { DeliveryController } from "./delivery-report.controller";
import { upload } from "../../utils/multer";

 
const deliveryRoutes = (
  deliveryController: DeliveryController,
  jwtService: Jwt,
): Router => {
  const routes = Router();
  routes.post("/", AuthMiddleware(jwtService, ["USER"]), upload.single('evidence'),deliveryController.create);
  routes.post("/:delivery_id/evidence", AuthMiddleware(jwtService, ["USER"]), upload.single('evidence'),deliveryController.createNewEvidence);
  routes.get("/:delivery_id/evidence", AuthMiddleware(jwtService, ["ADMIN", "USER"]),deliveryController.getEvidences);



  return routes;
};

export default deliveryRoutes;
