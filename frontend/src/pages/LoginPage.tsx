import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Compass, ArrowLeft, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Přihlášení se nezdařilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět na veřejné výsledky</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl shadow-lg border border-white/20 bg-gradient-to-br from-[#EE6422] to-white flex items-center justify-center">
            <Compass className="w-8 h-8 text-slate-900 drop-shadow" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Správa orientačního běhu</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Přihlášení do administrace závodů a časomíry
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-200 flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1">
              <User className="w-4 h-4 text-slate-400" />
              <span>Uživatelské jméno</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Heslo</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <span className="font-bold">Výchozí přístupové údaje:</span>
            <div className="font-mono text-slate-700">
              Uživatel: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">admin</code> / Heslo: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">admin123</code>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Přihlašuji...' : 'Přihlásit se do administrace'}
          </button>
        </form>
      </div>
    </div>
  );
};
