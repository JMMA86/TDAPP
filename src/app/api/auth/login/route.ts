import { prisma } from '@/infrastructure/database/prisma/client';
import { authService } from '@/infrastructure/auth/jwt-auth-service';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password } = await req.json();

    if (!rawEmail || !password) {
      return Response.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
    }

    const email = String(rawEmail).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return Response.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
    }

    const valid = await authService.verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
    }

    const token = await authService.signToken({
      userId: user.id,
      email: user.email,
      name: user.name || '',
    });

    const cookieOpts = authService.getCookieOptions();
    const cookieStore = await cookies();
    cookieStore.set(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return Response.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 200 },
    );
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
