import { UserRole } from "../modules/user/user.entity";
import jwt from "jsonwebtoken";
import { UnAuthorizedError } from "./error/UnAuthorizedError";
export interface Payload {
  user_id: string;
  role: UserRole;
  isActivate: boolean
}

export class Jwt {
  constructor(
    private readonly accessTokenSecret: string,
    private readonly refreshTokenSecret: string,
  ) {}
  async signAccessToken(payload: Payload): Promise<string> {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: "15m" });
  }

  async verifyAccessToken<T = unknown>(token: string): Promise<T> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret);
      return decoded as T;
    } catch {
      throw new UnAuthorizedError("Invalid or expired token");
    }
  }

  async signRefreshToken(payload: Payload): Promise<string> {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: "7d" });
  }

  async verifyRefreshToken<T = unknown>(token: string): Promise<T> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret);
      return decoded as T;
    } catch {
      throw new UnAuthorizedError("Invalid or expired token");
    }
  }
}
