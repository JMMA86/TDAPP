import { authService } from '@/infrastructure/auth/jwt-auth-service';
import { cookies } from 'next/headers';

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieOpts = authService.getCookieOptions();
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieOpts.name)?.value;
    if (!token) return null;

    const payload = await authService.verifyToken(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}
