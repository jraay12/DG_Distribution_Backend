import { StoreInventoryController } from './modules/inventory/store-inventory.controller';
import { StoreInventoryRepositiory } from './modules/inventory/store-inventory.repository';
import { StoreInventoryService } from './modules/inventory/store-inventory.service';
import { UserService } from "./modules/user/user.service";
import { UserController } from "./modules/user/user.controller";
import { UserRepository } from "./modules/user/user.repository";
import { Bcrypt } from "./utils/bcrypt";
import { prisma } from "./config/prisma";
import { Jwt } from "./utils/jwt";
import { AuthService } from "./modules/auth/auth.service";
import { AuthController } from "./modules/auth/auth.controller";
import { BrandController } from "./modules/brand/brand.controller";
import { BrandService } from "./modules/brand/brand.service";
import { BrandRepository } from "./modules/brand/brand.repository";
import { ModelService } from "./modules/model/model.service";
import { ModelController } from "./modules/model/model.controller";
import { ModelRepository } from "./modules/model/model.repository";
import { ProductController } from "./modules/product/product.controller";
import { ProductRepository } from "./modules/product/product.repository";
import { ProductService } from "./modules/product/product.service";
import { StatsController } from "./modules/stats/stats.controller";
import { StatsService } from "./modules/stats/stats.service";
import { InventoryController } from "./modules/inventory/inventory.controller";
import { InventoryRepository } from "./modules/inventory/inventory.repository";
import { InventoryService } from "./modules/inventory/inventory.services";
import { StockMovementRepository } from "./modules/Stock Movement/stock-movement.repository";
import { CustomerController } from "./modules/customer/customer.controller";
import { CustomerRepository } from "./modules/customer/customer.repository";
import { CustomerService } from './modules/customer/customer.service';
import { DeliveryController } from "./modules/delivery/delivery-report.controller";
import { DeliveryRepository } from "./modules/delivery/delivery.repository";
import { DeliveryService } from "./modules/delivery/delivery-report.service";
import { PromoCodeController } from "./modules/promo/promo.controller";
import { PromoCodeService } from "./modules/promo/promo.service";
import { PromoCodeRepository } from "./modules/promo/promo.repository";
import { StoreVisitRepository } from "./modules/store-visit/store-visit.repository";
import { StoreVisitController } from "./modules/store-visit/store-visit.controller";
import { StoreVisitService } from "./modules/store-visit/store-visit.service";
import { TransactionController } from "./modules/transaction/transaction.controller";
import { TransactionService } from "./modules/transaction/transaction.service";
import { TransactionRepository } from "./modules/transaction/transaction.repository";
import { DailyReportRepository } from "./modules/daily-report/daily-report.repository";
import { DailyReportService } from "./modules/daily-report/daily-report.service";
import { DailyReportController } from "./modules/daily-report/daily-report.controller";
import { QuotaRepository } from "./modules/quota/quota.repository";
import { QuotaService } from "./modules/quota/quota.service";
import { QuotaController } from "./modules/quota/quota.controller";
import { ActivityRepository } from "./modules/activity/activity.repository";
import { ActivityService } from "./modules/activity/activity.service";
import { ActivityController } from "./modules/activity/activity.controller";
import { ReportRepository } from "./modules/report/report.repository";
import { ReportService } from "./modules/report/report.service";
import { ReportController } from "./modules/report/report.controller";
const access_token_secret = process.env.ACCESS_TOKEN_SECRET!;
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET!;

// Other services
const bcrypt = new Bcrypt();
export const jwt = new Jwt(access_token_secret, refresh_token_secret);

// repository
const userRepository = new UserRepository(prisma);
const brandRepository = new BrandRepository(prisma)
const modelRepository = new ModelRepository(prisma)
const productRepository = new ProductRepository(prisma)
const inventoryRepository = new InventoryRepository(prisma)
const stockMovementRepository = new StockMovementRepository(prisma)
const customerRepository = new CustomerRepository(prisma)
const deliveryRepository = new DeliveryRepository(prisma)
const promoCodeRepository = new PromoCodeRepository(prisma)
const storeVisitRepository = new StoreVisitRepository(prisma)
const transactionRepository = new TransactionRepository(prisma)
const storeInventoryRepository = new StoreInventoryRepositiory(prisma)
const dailyReportRepository = new DailyReportRepository(prisma)
const quotaRepository = new QuotaRepository(prisma)
const activityRepository = new ActivityRepository(prisma)
const reportRepository = new ReportRepository(prisma)
// service
const userService = new UserService(userRepository, bcrypt);
const authService = new AuthService(userRepository, jwt, bcrypt);
const brandService = new BrandService(brandRepository, userRepository)
const modelService = new ModelService(modelRepository, userRepository, brandRepository)
const productService = new ProductService(productRepository, modelRepository, prisma)
const statsService = new StatsService(productRepository, prisma)
const inventoryService = new InventoryService(inventoryRepository, productRepository, stockMovementRepository, prisma)
const customerService = new CustomerService(customerRepository)
const deliveryService = new DeliveryService(deliveryRepository, storeVisitRepository)
const promoCodeService = new PromoCodeService(promoCodeRepository)
const storeVisitService = new StoreVisitService(storeVisitRepository, customerRepository, userRepository, prisma)
const transactionService = new TransactionService(transactionRepository, storeVisitRepository, productRepository, inventoryRepository, stockMovementRepository, storeInventoryRepository, promoCodeRepository, prisma)
const storeInventoryService = new StoreInventoryService(storeInventoryRepository, customerRepository, productRepository, stockMovementRepository, prisma, storeVisitRepository)
const dailyReportService = new DailyReportService(dailyReportRepository)
const quotaService = new QuotaService(quotaRepository, userRepository)
const activityService = new ActivityService(activityRepository, storeVisitRepository)
const reportService = new ReportService(reportRepository)
// controller
export const userController = new UserController(userService);
export const authController = new AuthController(authService)
export const brandController = new BrandController(brandService)
export const modelController = new ModelController(modelService)
export const productController = new ProductController(productService)
export const statsController = new StatsController(statsService)
export const inventoryController = new InventoryController(inventoryService)
export const customerController = new CustomerController(customerService)
export const deliveryController = new DeliveryController(deliveryService)
export const promoCodeController = new PromoCodeController(promoCodeService)
export const storeVisitController = new StoreVisitController(storeVisitService)
export const transactionController = new TransactionController(transactionService)
export const storeInventoryController = new StoreInventoryController(storeInventoryService)
export const dailyReportController = new DailyReportController(dailyReportService)
export const quotaController = new QuotaController(quotaService)
export const activityController = new ActivityController(activityService)
export const reportController = new ReportController(reportService)
