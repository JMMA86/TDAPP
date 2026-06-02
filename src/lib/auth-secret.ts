// Single source of truth for the JWT signing secret.
// Uses only TextEncoder — safe for both Node.js and Edge (middleware) runtimes.
// bcryptjs lives in jwt-auth-service.ts and must NOT be imported here.

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tdapp-dev-secret-change-in-production',
);
