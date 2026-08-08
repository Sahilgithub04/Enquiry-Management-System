import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'cloudblitz_super_secret_jwt_key_2026';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'cloudblitz_super_secret_jwt_key_2026';
  return jwt.verify(token, secret) as TokenPayload;
};
