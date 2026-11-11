import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, ShieldCheck, Users, LogOut, LogIn, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 relative rounded overflow-hidden shadow border border-white/20 bg-gradient-to-br from-[#EE6422] to-white flex items-center justify-center">
                <Compass className="w-5 h-5 text-slate-900 drop-shadow" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-orange-400 transition">
                  Orienteering
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs bg-orange-600/30 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 font-medium">
                  IS DCE
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/') && !location.pathname.startsWith('/admin')
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Výsledky</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/admin') && !isActive('/admin/competitors')
                      ? 'bg-slate-800 text-white shadow-inner'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Správa závodů</span>
                </Link>

                <Link
                  to="/admin/competitors"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/admin/competitors')
                      ? 'bg-slate-800 text-white shadow-inner'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Závodníci</span>
                </Link>
              </>
            )}
          </div>

          {/* User Auth controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:inline-block text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full font-mono">
                  admin: {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 border border-slate-700 hover:border-red-800 rounded-md transition flex items-center space-x-1"
                  title="Odhlásit se"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Odhlásit</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-md shadow transition flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin přihlášení</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
