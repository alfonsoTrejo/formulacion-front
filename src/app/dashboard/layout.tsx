// src/app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import '@/app/globals.css';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/dashboard/elecciones', label: 'Elecciones' },
    { href: '/dashboard/partidos', label: 'Partidos' },
  ];

  const handleLogout = () => {
    // Elimina el token de las cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
  };

  return (
    <html lang="es">
      <body className="text-gray-900">
        <nav className="bg-gray-800 text-white px-6 py-4 shadow flex items-center justify-between">
          <ul className="flex space-x-6 font-medium">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`transition-all duration-200 ${
                    pathname.startsWith(href)
                      ? 'underline text-lg'
                      : 'hover:underline hover:text-lg'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-h-screen">{children}</main>

        {/* Botón de Logout flotante */}
        <button
          onClick={handleLogout}
          className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all duration-200"
        >
          <LogOut size={24} />
        </button>
      </body>
    </html>
  );
}
