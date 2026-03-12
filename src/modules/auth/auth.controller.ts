import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/LoginDTO";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: LoginDTO = req.body;
      const { refreshToken, accessToken } = await this.authService.login(input);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
