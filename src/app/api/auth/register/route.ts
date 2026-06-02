import { prisma } from '@/infrastructure/database/prisma/client';
import { authService } from '@/infrastructure/auth/jwt-auth-service';
import { cookies } from 'next/headers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MAX = 72;

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password, name } = await req.json();

    if (!rawEmail || !password || !name) {
      return Response.json({ error: 'Email, contraseña y nombre son obligatorios' }, { status: 400 });
    }

    const email = String(rawEmail).trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: 'El formato del email no es válido' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    if (password.length > PASSWORD_MAX) {
      return Response.json({ error: 'La contraseña es demasiado larga' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Este email ya está registrado' }, { status: 409 });
    }

    const passwordHash = await authService.hashPassword(password);

    const user = await prisma.user.create({
      data: { email, name: String(name).trim(), passwordHash },
    });

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
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
