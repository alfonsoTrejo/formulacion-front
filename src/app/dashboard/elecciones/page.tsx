'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {ip} from "@/utild";
import { useRouter } from 'next/navigation';

interface Eleccion {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: string;
  numero_escano: number;
}

interface Formula {
  id: number;
  nombre: string;
}

export default function EleccionesPage() {
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    numero_escano: string;
    formula_id: number | null;
  }>({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    numero_escano: '',
    formula_id: null,
  });
  const router = useRouter();

  // Función para obtener el token del almacenamiento local
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const fetchElecciones = () => {
    const token = getToken();
    if (!token) {
      router.push('/login'); // Redirigir si no hay token
      return;
    }

    fetch(`${ip}/elecciones`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        return res.json();
      })
      .then(data => setElecciones(data))
      .catch(err => console.error('Error fetching elecciones:', err));
  };

  const fetchFormulas = () => {
    fetch(`${ip}/formulas`)
      .then(res => res.json())
      .then(data => setFormulas(data))
      .catch(err => console.error('Error fetching formulas:', err));
  };

  useEffect(() => {
    fetchElecciones();
    fetchFormulas();
  }, []);

  const handleCreate = () => {
    const token = getToken();
    fetch(`${ip}/elecciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false);
        setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', numero_escano: '', formula_id: null });
        fetchElecciones();
      })
      .catch(err => console.error('Error al crear elección:', err));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Elecciones</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Crear nueva
        </button>
      </div>

      {elecciones.length === 0 ? (
        <p className="text-gray-600">No hay elecciones registradas.</p>
      ) : (
        <div className="grid gap-4">
          {elecciones.map((eleccion) => (
            <Link
              key={eleccion.id}
              href={`/dashboard/elecciones/${eleccion.id}`}
              className="block p-4 bg-white rounded-xl shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-800">{eleccion.nombre}</h2>
              <p className="text-gray-600 text-sm">
                {eleccion.tipo} — {eleccion.fecha_inicio} a {eleccion.fecha_fin}
              </p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
    <h2 className="text-2xl font-bold mb-4">Nueva Elección</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input type="text" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border px-4 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
        <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} className="w-full border px-4 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
        <input type="date" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} className="w-full border px-4 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Escaño</label>
        <input type="text" placeholder="Nombre" value={form.numero_escano} onChange={e => setForm({ ...form, numero_escano: e.target.value })} className="w-full border px-4 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fórmula</label>
        <select
          value={form.formula_id || ''}
          onChange={e => setForm({ ...form, formula_id: e.target.value ? parseInt(e.target.value) : null })}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="">{formulas.length > 0 ? 'Selecciona una fórmula' : 'No hay fórmulas disponibles'}</option>
          {formulas.map(f => (
            <option key={f.id} value={f.id}>{f.nombre}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="mt-6 flex justify-end space-x-4">
      <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
      <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Guardar</button>
    </div>
  </div>
</div>
      )}
    </div>
  );
}
