import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  role: string;
}

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "cloudblitz_super_secret_jwt_key_2026";
};

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
