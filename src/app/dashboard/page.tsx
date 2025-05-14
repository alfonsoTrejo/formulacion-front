// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChartLine, Users, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Simulando la obtención del nombre de usuario desde el token
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=').map(c => c.trim());
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies.token;
    if (token) {
      // Aquí podrías decodificar el token para obtener el nombre del usuario
      setUsername('Jorge Araujo');
    }
  }, []);

  const cards = [
    {
      title: 'Elecciones',
      description: 'Gestiona las elecciones activas y pasadas.',
      href: '/dashboard/elecciones',
      icon: <ChartLine size={40} />,
    },
    {
      title: 'Partidos',
      description: 'Configura y administra los partidos políticos.',
      href: '/dashboard/partidos',
      icon: <Users size={40} />,
    },
    {
      title: 'Fórmulas',
      description: 'Administra las fórmulas para las elecciones.',
      href: '/dashboard/formulas',
      icon: <Briefcase size={40} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bienvenido, {username}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {cards.map(({ title, description, href, icon }) => (
            <Link key={title} href={href}>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-200 group">
                <div className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                  {title}
                </h2>
                <p className="text-gray-600">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
