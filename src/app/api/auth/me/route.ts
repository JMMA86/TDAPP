import { authService } from '@/infrastructure/auth/jwt-auth-service';
import { prisma } from '@/infrastructure/database/prisma/client';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieOpts = authService.getCookieOptions();
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieOpts.name)?.value;

    if (!token) {
      return Response.json({ user: null }, { status: 200 });
    }

    const payload = await authService.verifyToken(token);
    if (!payload) {
      return Response.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return Response.json({ user: null }, { status: 200 });
    }

    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 200 });
  } catch {
    return Response.json({ user: null }, { status: 200 });
  }
}
