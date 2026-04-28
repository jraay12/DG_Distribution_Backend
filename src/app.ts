import express from "express";
import { Request, Response } from "express";
import { errorHandler } from "./utils/middleware/error.middleware";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import brandRoutes from "./modules/brand/brand.routes";
import modelRoutes from "./modules/model/model.routes";
import productRoutes from "./modules/product/product.routes";
import statsRoutes from "./modules/stats/stats.routes";
import { userController, promoCodeController, authController, jwt, brandController, modelController, productController, statsController, inventoryController, customerController, deliveryController } from "./container";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "node:http";
import { socketInit } from "./utils/socket/socket.server";
import inventoryRoutes from "./modules/inventory/inventory.routes"; 
import customerRoutes from "./modules/customer/customer.routes";
import deliveryRoutes from "./modules/delivery/delivery-report.routes";
import promoCodeRoutes from "./modules/promo/promo.routes";
const app = express();
const server = createServer(app)
socketInit(server)
app.use(cors({ origin: "http://localhost:5174" , credentials: true, methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes(userController, jwt));
app.use("/api/brand", brandRoutes(brandController, jwt));
app.use("/api/model", modelRoutes(modelController, jwt));
app.use("/api/stats", statsRoutes(statsController, jwt));
app.use("/api/product", productRoutes(productController, jwt));
app.use("/api/customer", customerRoutes(customerController, jwt));
app.use("/api/inventory", inventoryRoutes(inventoryController, jwt));
app.use("/api/delivery", deliveryRoutes(deliveryController, jwt));
app.use("/api/promo", promoCodeRoutes(promoCodeController, jwt));
app.use("/api/auth", authRoutes(authController));


app.use(errorHandler);

export default server;
