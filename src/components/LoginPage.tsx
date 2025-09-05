import React, { useState } from 'react';
import { auth } from '../firebase'; // Correctly imports only what's needed
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Listener di App.tsx akan menangani sisanya
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Email tidak terdaftar. Silakan registrasi terlebih dahulu.');
          break;
        case 'auth/wrong-password':
          setError('Password yang Anda masukkan salah.');
          break;
        case 'auth/email-already-in-use':
          setError('Email ini sudah terdaftar. Silakan login.');
          break;
        case 'auth/weak-password':
          setError('Password harus terdiri dari minimal 6 karakter.');
          break;
        default:
          setError('Terjadi kesalahan. Silakan coba lagi.');
          console.error("Firebase auth error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-surface rounded-xl shadow-lg text-center w-full max-w-sm">
        <img 
          src="https://res.cloudinary.com/dnci7vkv4/image/upload/v1756788264/logo-kdmp_e0gttt.png" 
          alt="KDMP Logo" 
          className="h-20 mx-auto mb-4" 
        />
        <h1 className="text-xl font-bold text-primary-dark leading-tight">KDMP Penfui Timur</h1>
        <p className="text-sm text-text-secondary mb-6">{isRegistering ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}</p>
        
        <form onSubmit={handleAuthAction} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400"
            >
              {loading ? 'Memproses...' : (isRegistering ? 'Registrasi' : 'Login')}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-sm text-primary-dark hover:underline"
          >
            {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Registrasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;