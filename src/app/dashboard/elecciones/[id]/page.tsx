'use client';

import { useEffect, useState, useRef } from 'react';
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

interface Formula {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Candidato {
  id: number;
  nombre: string;
  partido?: string;
  cargo?: string;
}

export default function EleccionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const eleccionRes = await fetch(`${ip}/elecciones/${params.id}`);
        if (!eleccionRes.ok) throw new Error('Elección no encontrada');
        const eleccionData = await eleccionRes.json();
        setEleccion(eleccionData);

        if (eleccionData.formula_id) {
          const formulaRes = await fetch(`${ip}/formulas/${eleccionData.formula_id}`);
          if (formulaRes.ok) {
            const formulaData = await formulaRes.json();
            setFormula(formulaData);

            const candidatosRes = await fetch(`${ip}/formulas/${eleccionData.formula_id}/candidatos`);
            if (candidatosRes.ok) {
              const candidatosData = await candidatosRes.json();
              setCandidatos(candidatosData);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${ip}/elecciones/${params.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.push('/dashboard/elecciones');
      } else {
        throw new Error('Error al eliminar la elección');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      console.error('Delete error:', err);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!eleccion) return <div className="p-8">Elección no encontrada</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{eleccion.nombre}</h1>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/elecciones/${params.id}/editar`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Editar
            </Link>
            <button
              onClick={openModal}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Eliminar
            </button>
          </div>
        </div>

{/* Modal de confirmación */}
{isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Fondo borroso sin afectar el modal */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Contenedor del modal */}
    <div ref={modalRef} className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-sm z-10">
      <p className="text-gray-900 text-lg mb-6">
        ¿Estás seguro de que quieres eliminar esta elección? Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            handleDelete();
            closeModal();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-900">Tipo de elección</p>
              <p className="font-medium text-gray-500">{eleccion.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900">Fórmula asociada</p>
              <p className="font-medium text-gray-500">
                {formula ? (
                  <Link href={`/dashboard/formulas/${formula.id}`} className="text-indigo-600 hover:underline">
                    {formula.nombre}
                  </Link>
                ) : 'Ninguna'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-900">Fecha de inicio</p>
              <p className="font-medium text-gray-500">{new Date(eleccion.fecha_inicio).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900">Fecha de fin</p>
              <p className="font-medium text-gray-500">{new Date(eleccion.fecha_fin).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {formula && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Detalles de la Fórmula</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-900">Nombre</p>
              <p className="font-medium text-gray-500">{formula.nombre}</p>
            </div>
            {formula.descripcion && (
              <div className="mb-4">
                <p className="text-sm text-gray-900">Descripción</p>
                <p className="font-medium text-gray-500">{formula.descripcion}</p>
              </div>
            )}
            
            {candidatos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Candidatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidatos.map(candidato => (
                    <div key={candidato.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <p className="font-medium">{candidato.nombre}</p>
                      {candidato.partido && <p className="text-sm text-gray-600">{candidato.partido}</p>}
                      {candidato.cargo && <p className="text-sm text-gray-500">{candidato.cargo}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Link
            href="/dashboard/elecciones"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    </div>
  );
}
