import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth-secret';

const SECRET = JWT_SECRET;
const TOKEN_EXPIRY = '7d';
const PASSWORD_MAX_LENGTH = 72; // bcrypt silently truncates beyond 72 bytes

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export class JwtAuthService {
  async hashPassword(password: string): Promise<string> {
    if (password.length > PASSWORD_MAX_LENGTH) {
      throw new Error('La contraseña es demasiado larga');
    }
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async signToken(payload: JwtPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(SECRET);
  }

  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      return payload as unknown as JwtPayload;
    } catch {
      return null;
    }
  }

  getCookieOptions(): { name: string; httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number } {
    return {
      name: 'tdapp-token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    };
  }
}

export const authService = new JwtAuthService();
