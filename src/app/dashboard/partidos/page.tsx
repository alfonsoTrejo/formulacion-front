'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {ip} from "@/utild"

interface Partido {
    id: number;
    nombre: string;
    siglas: string;
    logo_url: string;
}


export default function EleccionesPage() {
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Partido>({
        id: 0,
        nombre: '',
        siglas: '',
        logo_url: ''
    });

    const fetchPartidos = () => {
        fetch(`${ip}/partidos`)
            .then(res => res.json())
            .then(data => setPartidos(data))
            .catch(err => console.error('Error fetching partidos:', err));
    };

    useEffect(() => {
        fetchPartidos();
    }, []);

    const handleCreate = () => {
        fetch(`${ip}/partidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
            .then(res => res.json())
            .then(data => {
                setPartidos([...partidos, data]);
                setShowModal(false);
                setForm({ id: 0, nombre: '', siglas: '', logo_url: '' });
            })
            .catch(err => console.error('Error creating partido:', err));
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100 text-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Partidos</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Agregar Partido
            </button>
          </div>
    
          {partidos.length === 0 ? (
            <p className="text-gray-600">No hay elecciones registradas.</p>
          ) : (
            <div className="grid gap-4">
              {partidos.map((partido) => (
                <Link
                  key={partido.id}
                  href={`/dashboard/partidos/${partido.id}`}
                  className="block p-4 bg-white rounded-xl shadow hover:shadow-md transition"
                >
                  <h2 className="text-xl font-semibold text-gray-800">{partido.siglas}</h2>
                  <p className="text-gray-600 text-sm">
                    {partido.nombre}
                  </p>
                </Link>
              ))}
            </div>
          )}
    
          {showModal && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Nuevo Partido</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border px-4 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Siglas</label>
            <input type="text" placeholder="Siglas" value={form.siglas} onChange={e => setForm({ ...form, siglas: e.target.value })} className="w-full border px-4 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <input type="text" placeholder="Logo" value={form.nombre} onChange={e => setForm({ ...form, logo_url: e.target.value })} className="w-full border px-4 py-2 rounded" />
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