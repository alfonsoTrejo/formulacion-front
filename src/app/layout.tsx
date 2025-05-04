// src/app/layout.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard/elecciones', label: 'Elecciones' },
    { href: '/dashboard/partidos', label: 'Partidos' },
    { href: '/dashboard/formulas', label: 'Fórmulas' },
  ];

  return (
    <html lang="es">
      <body className="text-gray-900">
        <nav className="bg-gray-800 text-white px-6 py-4 shadow">
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
      </body>
    </html>
  );
}
