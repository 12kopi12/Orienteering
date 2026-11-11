import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Race } from '../api/types';
import { Trophy, Calendar, MapPin, ChevronRight, Compass } from 'lucide-react';

export const PublicRacesPage: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.races
      .list()
      .then((data) => setRaces(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Datum neupřesněno';
    const date = new Date(isoString);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 mb-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-orange-600/30 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Oficiální výsledkový portál</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Výsledky závodů v orientačním běhu
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Prohlížejte oficiální výsledkové listiny ukončených závodů, mezičasy a odstupy od vítězů
            ve všech vypsaných kategoriích.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-slate-800/60 rounded-xl border border-slate-700 text-center min-w-[200px]">
          <Trophy className="w-12 h-12 text-amber-400 mb-2 drop-shadow" />
          <div className="text-2xl font-bold text-white font-mono">{races.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Ukončených závodů</div>
        </div>
      </div>

      {/* Race list header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ukončené závody</h2>
          <p className="text-sm text-slate-500">Závody s potvrzenými a zveřejněnými výsledky</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          Chyba při načítání závodů: {error}
        </div>
      ) : races.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Žádné ukončené závody</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            V databázi zatím není žádný ukončený závod. Výsledky se zde objeví okamžitě po potvrzení
            konce závodu administrátorem.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {races.map((race) => (
            <div
              key={race.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1"></span>
                    Výsledky zveřejněny
                  </span>
                  {race.category_count !== undefined && (
                    <span className="text-xs text-slate-500 font-medium">
                      {race.category_count}{' '}
                      {race.category_count === 1
                        ? 'kategorie'
                        : race.category_count > 1 && race.category_count < 5
                        ? 'kategorie'
                        : 'kategorií'}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition mb-2">
                  {race.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                  {race.event_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(race.event_date)}</span>
                    </div>
                  )}
                  {race.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{race.location}</span>
                    </div>
                  )}
                </div>

                {race.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {race.description}
                  </p>
                )}

                {/* Categories badge preview */}
                {race.categories && race.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {race.categories.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium border border-slate-200"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-600 group-hover:underline">
                  Zobrazit výsledky
                </span>
                <Link
                  to={`/results/${race.id}`}
                  className="p-1.5 bg-white group-hover:bg-orange-600 group-hover:text-white rounded-lg border border-slate-200 group-hover:border-orange-600 transition shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
