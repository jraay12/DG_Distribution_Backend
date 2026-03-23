import { UnAuthorizedError } from "../error/UnAuthorizedError";
import { Jwt, Payload } from "../jwt";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user: Payload;
    }
  }
}

export const AuthMiddleware = (jwtService: Jwt) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) throw new UnAuthorizedError("No token provided");

      const userPayload = await jwtService.verifyAccessToken<Payload>(token);

      req.user = {
        user_id: userPayload.user_id,
        role: userPayload.role
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};