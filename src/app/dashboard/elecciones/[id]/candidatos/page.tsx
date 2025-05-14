import { useState } from 'react';

export default function CandidatosPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    partido: '',
  });

  const handleCreate = () => {
    // Aquí puedes agregar la lógica para enviar los datos del formulario al backend
    console.log('Candidato creado:', form);
    setShowModal(false);
    setForm({ nombre: '', partido: '' });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Candidatos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Agregar Candidato
        </button>
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
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Partido</label>
                <input
                  type="text"
                  placeholder="Partido"
                  value={form.partido}
                  onChange={(e) => setForm({ ...form, partido: e.target.value })}
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
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}