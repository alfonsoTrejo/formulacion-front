// src/app/layout.tsx
'use client';

import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <title>Mi Proyecto</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
