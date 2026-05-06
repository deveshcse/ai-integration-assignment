// Business logic for auth: hashing passwords, creating users, verifying credentials, signing JWTs.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "./user.model.js";

function getJwtConfig(): { secret: string; expiresIn: string } {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  if (!expiresIn) throw new Error("JWT_EXPIRES_IN environment variable is not set.");
  return { secret, expiresIn };
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ token: string }> {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, passwordHash });

  const { secret, expiresIn } = getJwtConfig();
  const token = jwt.sign(
    { id: user._id.toString(), email },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
  );

  return { token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string }> {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const { secret, expiresIn } = getJwtConfig();
  const token = jwt.sign(
    { id: user._id.toString(), email },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
  );

  return { token };
}
