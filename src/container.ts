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

// service
const userService = new UserService(userRepository, bcrypt);
const authService = new AuthService(userRepository, jwt, bcrypt);
const brandService = new BrandService(brandRepository, userRepository)
const modelService = new ModelService(modelRepository, userRepository, brandRepository)
const productService = new ProductService(productRepository, modelRepository)

// controller
export const userController = new UserController(userService);
export const authController = new AuthController(authService)
export const brandController = new BrandController(brandService)
export const modelController = new ModelController(modelService)
export const productController = new ProductController(productService)