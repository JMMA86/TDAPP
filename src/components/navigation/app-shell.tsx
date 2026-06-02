'use client';

import { usePathname } from 'next/navigation';
import NavigationBar from '@/components/navigation/navigation-bar';

const AUTH_PATHS = ['/login', '/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isAuthPage && <NavigationBar />}
      <main className={`flex-1 ${isAuthPage ? 'min-h-screen' : 'pb-20 md:pb-0 md:ml-56'}`}>
        {children}
      </main>
    </>
  );
}
