'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ip } from '@/utild';

interface Partido {
    id: number;
    nombre: string;
    siglas: string;
    logo_url: string;
}

interface Candidato {
    id: number;
    nombre: string;
    partido_id: number;
    circunscripcion?: string;
}

export default function EleccionDetailPage({ params }: { params: { id: number } }) {
    const router = useRouter();
    const [partido, setPartidos] = useState<Partido | null>(null);
    const [candidatos, setCandidatos] = useState<Candidato[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Candidato>({
        id: 0,
        nombre: '',
        partido_id: params.id,
        circunscripcion: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch partido data
                const partidoRes = await fetch(`${ip}/partidos/${params.id}`);
                if (!partidoRes.ok) throw new Error('Partido no encontrado');
                const partidoData = await partidoRes.json();
                setPartidos(partidoData);

                // Fetch candidatos data
                const candidatosRes = await fetch(`${ip}/candidatos/partido/${params.id}`);
                if (!candidatosRes.ok) throw new Error('Error al obtener candidatos');
                const candidatosData = await candidatosRes.json();
                setCandidatos(candidatosData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    const handleCreate = () => {
        fetch(`${ip}/candidatos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
            .then(res => res.json())
            .then(data => {
                setCandidatos([...candidatos, data]);
                setShowModal(false);
                setForm({ id: 0, nombre: '', partido_id: params.id, circunscripcion: '' });
            })
            .catch(err => console.error('Error creating partido:', err));
    };

    if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!partido) return <div className="p-8">Elección no encontrada</div>;

    return (
        <div className="min-h-screen p-8 bg-gray-100 text-gray-900">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{partido.nombre}</h1>
                <div className="space-x-4">
                    <Link href={`/dashboard/partidos/${partido.id}/edit`}>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
                            Editar
                        </button>
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        Agregar Candidato
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Nuevo Candidato</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full border px-4 py-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Circunscripción</label>
                                <input
                                    type="text"
                                    placeholder="Circunscripción"
                                    value={form.circunscripcion}
                                    onChange={e => setForm({ ...form, circunscripcion: e.target.value })}
                                    className="w-full border px-4 py-2 rounded"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <img src={partido.logo_url} alt={partido.nombre} className="w-32 h-32 rounded-full" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Candidatos</h2>
            {candidatos.length === 0 ? (
                <p className="text-gray-600">No hay elecciones registradas.</p>
            ) : (
                <div className="grid gap-4">
                    {candidatos.map((candidato) => (
                        <div
                            key={candidato.id}
                            className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
                        >
                            <h2 className="text-xl font-semibold text-gray-800">{candidato.nombre}</h2>
                            <p className="text-gray-600 text-sm">
                                {candidato.circunscripcion}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}