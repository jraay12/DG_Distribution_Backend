import { BadRequestError } from "../../utils/error/BadRequestError";
import crypto from "crypto";

export type UserRole = "ADMIN" | "USER";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;
  private static readonly MIN_PASSWORD_LENGTH = 8;

  constructor(props: UserProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  // --- Factory method ---
  static create(
    props: Omit<UserProps, "id" | "createdAt" | "updatedAt" | "isActive">,
  ): User {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!props.name || props.name.trim().length === 0) {
      throw new BadRequestError("Name is required");
    }

    if (!emailRegex.test(props.email)) {
      throw new BadRequestError("Invalid email format");
    }

    if (props.password.length < this.MIN_PASSWORD_LENGTH) {
      throw new BadRequestError(
        `Password must be greater than ${this.MIN_PASSWORD_LENGTH} characters`,
      );
    }

    const validRoles: UserRole[] = ["ADMIN", "USER"];
    if (!validRoles.includes(props.role)) {
      throw new BadRequestError("Invalid role");
    }

    return new User({ ...props, isActive: true, id: crypto.randomUUID() });
  }

  // --- Reconstitute from DB (no validation) ---
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // --- Getters ---
  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get password() {
    return this.props.password;
  }
  get isActive() {
    return this.props.isActive;
  }
  get role() {
    return this.props.role;
  }
  get createdAt() {
    return this.props.createdAt!;
  }
  get updatedAt() {
    return this.props.updatedAt!;
  }

  // --- Behaviors ---
  isAdmin(): boolean {
    return this.props.role === "ADMIN";
  }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new BadRequestError("User is already inactive");
    }
    this.props.isActive = false;
    this.touch();
  }

  activate(): void {
    if (this.props.isActive) {
      throw new BadRequestError("User is already active");
    }
    this.props.isActive = true;
    this.touch();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestError("Name is required");
    }
    this.props.name = name.trim();
    this.touch();
  }

  updateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("Invalid email format");
    }
    this.props.email = email;
    this.touch();
  }

  updatePassword(hashedPassword: string): void {

    if (hashedPassword.length < User.MIN_PASSWORD_LENGTH) throw new BadRequestError(`Password must be greater than ${User.MIN_PASSWORD_LENGTH} characters`)
    this.props.password = hashedPassword;
    this.touch();
  }

  setPassword(hashedPassword: string): void {
    this.props.password = hashedPassword;
  }

  changeRole(role: UserRole): void {
    const validRoles: UserRole[] = ["ADMIN", "USER"];
    if (!validRoles.includes(role)) {
      throw new BadRequestError("Invalid role");
    }
    this.props.role = role;
    this.touch();
  }

  toSafeObject(): Omit<UserProps, "password"> {
    const { password, ...safe } = this.props;
    return safe;
  }

  // --- Private ---
  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
