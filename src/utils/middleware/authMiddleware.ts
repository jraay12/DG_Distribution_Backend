import { ForbiddenError } from "../error/ForbiddenError";
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

export const AuthMiddleware = (jwtService: Jwt, allowedRoles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) throw new UnAuthorizedError("No token provided");

      const userPayload = await jwtService.verifyAccessToken<Payload>(token);

       if (allowedRoles.length && !allowedRoles.includes(userPayload.role)) {
        throw new ForbiddenError("You do not have permission to perform this action");
      }

      if (!userPayload.isActivate) throw new ForbiddenError("Your account is not activated");

      req.user = {
        user_id: userPayload.user_id,
        role: userPayload.role,
        isActivate: userPayload.isActivate
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};