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
  numero_escano: string;
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
  siglas: string;
  logo_url: string;
}

interface Voto {
  id: number;
  partido_id: number;
  eleccion_id: number;
  total_votos: number;
}

export default function EleccionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVotosModal, setShowVotosModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [votesForm, setVotesForm] = useState<{ eleccion_id: number; partido_id: number | null; total_votos: number }>({
    eleccion_id: parseInt(params.id),
    partido_id: null,
    total_votos: 0,
  });
  const [editForm, setEditForm] = useState<Eleccion | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Función para obtener el token del almacenamiento local
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    async function loadData() {
      const token = getToken();
      if (!token) {
        router.push('/login'); // Redirigir si no hay token
        return;
      }
      try {
        setIsLoading(true);
        const eleccionRes = await fetch(`${ip}/elecciones/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

    async function loadVotos() {
      try {
        const res = await fetch(`${ip}/votos/eleccion/${params.id}`);
        if (res.ok) {
          const data: Voto[] = await res.json();
          setVotos(data);
          setVotesForm(prev => ({
            ...prev,
            total_votos: data.reduce((acc, voto) => acc + voto.total_votos, 0),
          }));
        }
      } catch (err) {
        console.error('Error fetching votos:', err);
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
    loadVotos();
  }, [params.id]);

  const handleDelete = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login'); // Redirigir si no hay token
      return;
    }
    try {
      const res = await fetch(`${ip}/elecciones/${params.id}`, { method: 'DELETE',  headers: { 'Authorization': `Bearer ${token}` }, });
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
        `${ip}/votos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(votesForm),
        }
      );
      if (!res.ok) throw new Error('Error al registrar votos');
      setShowVotosModal(false);
      setVotesForm({ eleccion_id: parseInt(params.id), partido_id: null, total_votos: 0 });
    } catch (err) {
      console.error('Error registrar votos:', err);
    }
  };

  const openEditModal = () => {
    if (eleccion) setEditForm({ ...eleccion });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login'); // Redirigir si no hay token
      return;
    }
    if (!editForm) return;
    try {
      const res = await fetch(`${ip}/elecciones/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Error al editar la elección');
      setShowEditModal(false);
      setEleccion(editForm);
    } catch (err) {
      alert('Error al editar la elección');
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
            {/* Botón para abrir modal de edición */}
            <button
              onClick={openEditModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Editar
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
                    value={votesForm.total_votos}
                    onChange={e =>
                      setVotesForm({
                        ...votesForm,
                        total_votos: parseInt(e.target.value) || 0,
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

        {/* Modal de edición de elección */}
        {showEditModal && editForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-10">
              <h2 className="text-xl font-semibold mb-4 text-black">Editar Elección</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={editForm.nombre}
                    onChange={handleEditChange}
                    className="w-full border px-4 py-2 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Fecha de inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={editForm.fecha_inicio.slice(0, 10)}
                    onChange={handleEditChange}
                    className="w-full border px-4 py-2 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Fecha de fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={editForm.fecha_fin.slice(0, 10)}
                    onChange={handleEditChange}
                    className="w-full border px-4 py-2 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Número de Escaño</label>
                  <input
                    type="number"
                    name="numero_escano"
                    value={editForm.numero_escano}
                    onChange={handleEditChange}
                    className="w-full border px-4 py-2 rounded text-black"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400 text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar
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
              <p className="text-sm text-gray-900">Número de Escaño</p>
              <p className="font-medium text-gray-500">{eleccion.numero_escano}</p>
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

        {/* Asignación de escaños y lista de votos */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabla método D'Hondt */}
          <div className="md:w-3/4 w-full bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Asignación de escaños (D'Hondt)</h2>
            {votos.length === 0 || !eleccion ? (
              <p className="text-gray-600">No hay votos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 bg-blue-500 hover:bg-blue-600">Partido</th>
                      {Array.from({ length: parseInt(eleccion.numero_escano) }, (_, i) => (
                        <th key={i} className="border px-2 py-1 bg-blue-500 hover:bg-blue-600">Divisor {i + 1}</th>
                      ))}
                      <th className="border px-2 py-1 bg-blue-500 hover:bg-blue-600">Total Escaños</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votos
                      .filter(v => v.total_votos > 0)
                      .map(voto => {
                        const partido = partidos.find(p => p.id === voto.partido_id);
                        const votosPartido = voto.total_votos;
                        const numEscanos = parseInt(eleccion.numero_escano);
                        // Calcular los cocientes para D'Hondt
                        const cocientes = Array.from({ length: numEscanos }, (_, i) => votosPartido / (i + 1));
                        // Calcular escaños asignados
                        let allCocientes: { partidoId: number, valor: number, divisor: number, votos: number }[] = [];
                        votos.filter(v => v.total_votos > 0).forEach(v => {
                          for (let i = 1; i <= numEscanos; i++) {
                            allCocientes.push({ partidoId: v.partido_id, valor: v.total_votos / i, divisor: i, votos: v.total_votos });
                          }
                        });
                        allCocientes.sort((a, b) => b.valor - a.valor);
                        const top = allCocientes.slice(0, numEscanos);
                        // Para remarcar los seleccionados
                        const seleccionados = top.filter(c => c.partidoId === voto.partido_id).map(c => c.divisor);
                        const escaños = seleccionados.length;
                        return (
                          <tr key={voto.partido_id}>
                            <td className="border px-2 py-1 font-medium text-blue-700">{partido ? partido.nombre : 'Partido desconocido'} ({partido?.siglas})</td>
                            {cocientes.map((c, i) => {
                              const isSelected = seleccionados.includes(i + 1);
                              return (
                                <td key={i} className={`border px-2 py-1 ${isSelected ? 'bg-green-200 font-bold text-green-900' : 'text-blue-700'}`}>{Math.floor(c)}</td>
                              );
                            })}
                            <td className="border px-2 py-1 font-bold text-green-700">{escaños}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Lista de votos */}
          <div className="md:w-1/4 w-full bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Votos registrados</h2>
            {votos.length === 0 ? (
              <p className="text-gray-600">No hay votos registrados.</p>
            ) : (
              <ul className="list-disc pl-5">
                {votos.map((voto) => {
                  const partido = partidos.find(p => p.id === voto.partido_id);
                  return (
                    <li key={voto.id} className="mb-2 text-gray-600">
                      <span className="font-medium">{partido?.siglas}:</span> {voto.total_votos} votos
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Representación gráfica de escaños */}
        {votos.length > 0 && eleccion && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Representación gráfica de escaños</h2>
            <div className="grid grid-cols-8 gap-2">
              {(() => {
                // Calcular escaños por partido usando D'Hondt
                const numEscanos = parseInt(eleccion.numero_escano);
                let allCocientes: { partidoId: number, valor: number }[] = [];
                partidos.forEach(p => {
                  const v = votos.find(vv => vv.partido_id === p.id);
                  const votosP = v ? v.total_votos : 0;
                  for (let i = 1; i <= numEscanos; i++) {
                    allCocientes.push({ partidoId: p.id, valor: votosP / i });
                  }
                });
                allCocientes.sort((a, b) => b.valor - a.valor);
                const top = allCocientes.slice(0, numEscanos);
                // Contar escaños por partido
                const escañosPorPartido: Record<number, number> = {};
                top.forEach(c => {
                  escañosPorPartido[c.partidoId] = (escañosPorPartido[c.partidoId] || 0) + 1;
                });
                // Generar array de escaños con partido
                let escaños: { partido: Partido | undefined }[] = [];
                Object.entries(escañosPorPartido).forEach(([partidoId, count]) => {
                  const partido = partidos.find(p => p.id === Number(partidoId));
                  for (let i = 0; i < count; i++) {
                    escaños.push({ partido });
                  }
                });
                // Ordenar por cantidad de escaños descendente
                escaños.sort((a, b) => {
                  if (!a.partido || !b.partido) return 0;
                  const aCount = escañosPorPartido[a.partido.id] || 0;
                  const bCount = escañosPorPartido[b.partido.id] || 0;
                  return bCount - aCount;
                });
                // Mostrar cuadricula
                return escaños.map((e, i) => (
                  <div key={i} className="flex flex-col items-center justify-center border rounded p-1 bg-blue-100 text-xs font-semibold" style={{ backgroundColor: e.partido?.logo_url ? undefined : '#e0e7ff' }}>
                    {e.partido?.logo_url ? (
                      <img src={e.partido.logo_url} alt={e.partido.nombre} className="h-6 w-6 object-contain mb-1" />
                    ) : null}
                    <span className="text-blue-900">{e.partido?.siglas || '?'}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            href="/dashboard/elecciones"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    </div>
  );
}
