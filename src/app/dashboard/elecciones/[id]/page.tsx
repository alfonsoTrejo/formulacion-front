'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ip } from '@/utild';

interface Eleccion {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: string;
  formula_id: number;
}

export default function EleccionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [eleccion, setEleccion] = useState<Eleccion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    

}