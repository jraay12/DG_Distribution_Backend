import { Bcrypt } from "../../utils/bcrypt";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { UnAuthorizedError } from "../../utils/error/UnAuthorizedError";
import { Jwt, Payload } from "../../utils/jwt";
import { UserRepository } from "../user/user.repository";
import { LoginDTO } from "./dto/LoginDTO";

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private jwt: Jwt,
    private bcrypt: Bcrypt,
  ) {}

  async login(
    data: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(data.email);

    if (!user) throw new UnAuthorizedError("Invalid credentials");

    const matchPassword = await this.bcrypt.compare(
      data.password,
      user.password,
    );

    if (!matchPassword) throw new UnAuthorizedError("Invalid credentials");

    const accessToken = await this.jwt.signAccessToken({
      role: user.role,
      user_id: user.id,
    });

    const refreshToken = await this.jwt.signRefreshToken({
      role: user.role,
      user_id: user.id,
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const payload = await this.jwt.verifyRefreshToken<Payload>(refreshToken);

    const user = await this.userRepo.findById(payload.user_id);

    if (!user) throw new NotFoundError("User not found");

    const accessToken = await this.jwt.signAccessToken({
      role: payload.role,
      user_id: payload.user_id,
    });

    const newRefreshToken = await this.jwt.signRefreshToken({
      role: payload.role,
      user_id: payload.user_id,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
