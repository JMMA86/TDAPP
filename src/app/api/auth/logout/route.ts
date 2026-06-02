import { authService } from '@/infrastructure/auth/jwt-auth-service';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieOpts = authService.getCookieOptions();
  const cookieStore = await cookies();
  cookieStore.set(cookieOpts.name, '', {
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
    maxAge: 0,
  });

  return Response.json({ success: true }, { status: 200 });
}
