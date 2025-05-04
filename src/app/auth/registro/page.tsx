'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = () => {
    fetch('http://192.168.0.4:5000/auth/singUp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Mensaje === 'Registro exitoso') {
          setSuccessMessage('Cuenta creada exitosamente');
          setSuccess(true);
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else {
          setErrorMessage(data.Error || 'Error al crear la cuenta');
          setError(true);
        }
      })
      .catch(() => {
        setErrorMessage('Error al conectar con el servidor');
        setError(true);
      });
  };

  const closeModal = () => {
    setError(false);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
      {error && (
        <div className="absolute z-50 top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-4">
          <div className="text-2xl bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center">❌</div>
          <span>{errorMessage}</span>
          <button onClick={closeModal} className="ml-4 text-red-500 font-bold">✖</button>
        </div>
      )}

      {success && (
        <div className="absolute z-50 top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-4">
          <div className="text-2xl bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">✅</div>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear cuenta</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              Acepto los{' '}
              <a href="/terminos" className="text-indigo-600 hover:underline">
                Términos y Condiciones
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={!acceptedTerms}
            className={`w-full py-2 px-4 text-white rounded-lg transition-colors ${
              acceptedTerms ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <a href="/auth/login" className="text-indigo-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
