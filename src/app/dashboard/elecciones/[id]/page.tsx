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

interface Partido {
  id: number;
  nombre: string;
}

export default function EleccionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVotosModal, setShowVotosModal] = useState(false);
  const [votesForm, setVotesForm] = useState<{eleccion_id:number ; partido_id: number | null; votos: number }>({
    eleccion_id: parseInt(params.id),
    partido_id: null,
    votos: 0,
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const eleccionRes = await fetch(`${ip}/elecciones/${params.id}`);
        if (!eleccionRes.ok) throw new Error('Elección no encontrada');
        const eleccionData: Eleccion = await eleccionRes.json();
        setEleccion(eleccionData);

        if (eleccionData.formula_id) {
          const formulaRes = await fetch(`${ip}/formulas/${eleccionData.formula_id}`);
          if (formulaRes.ok) {
            const formulaData: Formula = await formulaRes.json();
            setFormula(formulaData);
            const candidatosRes = await fetch(
              `${ip}/formulas/${eleccionData.formula_id}/candidatos`
            );
            if (candidatosRes.ok) {
              const candData: Candidato[] = await candidatosRes.json();
              setCandidatos(candData);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    }

    async function loadPartidos() {
      try {
        const res = await fetch(`${ip}/partidos`);
        if (res.ok) {
          const data: Partido[] = await res.json();
          setPartidos(data);
        }
      } catch (err) {
        console.error('Error fetching partidos:', err);
      }
    }

    loadData();
    loadPartidos();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${ip}/elecciones/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard/elecciones');
      else throw new Error('Error al eliminar la elección');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleRegisterVotos = async () => {
    if (!votesForm.partido_id) return;
    try {
      const res = await fetch(
        `${ip}/elecciones/${params.id}/votos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(votesForm),
        }
      );
      if (!res.ok) throw new Error('Error al registrar votos');
      setShowVotosModal(false);
      setVotesForm({ partido_id: null, votos: 0 });
    } catch (err) {
      console.error('Error registrar votos:', err);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!eleccion) return <div className="p-8">Elección no encontrada</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Eliminar
            </button>
            <button
              onClick={() => setShowVotosModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Registrar Votos
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div
              ref={modalRef}
              className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-sm z-10"
            >
              <p className="text-gray-900 text-lg mb-6">
                ¿Estás seguro de que quieres eliminar esta elección? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Register Votes Modal */}
        {showVotosModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-sm z-10">
              <h2 className="text-xl font-semibold mb-4 text-black">Registrar Votos</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black">
                    Partido
                  </label>
                  <select
                    value={votesForm.partido_id ?? ''}
                    onChange={e =>
                      setVotesForm({
                        ...votesForm,
                        partido_id: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full border px-4 py-2 rounded text-black"
                  >
                    <option value="">Selecciona un partido</option>
                    {partidos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Votos</label>
                  <input
                    type="number"
                    min={0}
                    value={votesForm.votos}
                    onChange={e =>
                      setVotesForm({
                        ...votesForm,
                        votos: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border px-4 py-2 rounded text-black"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowVotosModal(false)}
                  className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterVotos}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información General */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Información General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-900">Tipo de elección</p>
              <p className="font-medium text-gray-500">{eleccion.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900">Fórmula asociada</p>
              <p className="font-medium text-gray-500">
                {formula ? (
                  <Link
                    href={`/dashboard/formulas/${formula.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {formula.nombre}
                  </Link>
                ) : (
                  'Ninguna'
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-900">Fecha de inicio</p>
              <p className="# font-medium text-gray-500">{new Date(eleccion.fecha_inicio).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900">Fecha de fin</p>
              <p className="# font-medium text-gray-500">{new Date(eleccion.fecha_fin).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Detalles de la Fórmula y Candidatos */}
        {formula && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Detalles de la Fórmula
            </h2>
            {formula.descripcion && (
              <div className="mb-4">
                <p className="text-sm text-gray-900">Descripción</p>
                <p className="font-medium text-gray-500">{formula.descripcion}</p>
              </div>
            )}
            {candidatos.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Candidatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidatos.map(c => (
                    <div
                      key={c.id}
                      className="border rounded-lg p-4 hover:bg-gray-50">
                      <p className="font-medium text-gray-900">{c.nombre}</p>
                      {c.partido && <p className="text-sm text-gray-600">{c.partido}</p>}
                      {c.cargo && <p className="text-sm text-gray-500">{c.cargo}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Link
            href="/dashboard/elecciones"
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    </div>
  );
}
