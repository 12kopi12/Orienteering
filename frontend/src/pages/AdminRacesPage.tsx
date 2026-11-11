import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Race, RaceStatus } from '../api/types';
import { CreateRaceModal } from '../components/CreateRaceModal';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Settings,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminRacesPage: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const data = await api.races.list();
      setRaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  const handleDeleteRace = async (id: number) => {
    try {
      await api.races.delete(id);
      setDeleteConfirmId(null);
      fetchRaces();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při mazání závodu');
    }
  };

  const filteredRaces = races.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Datum neuvedeno';
    const date = new Date(isoString);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: RaceStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Příprava / Přihlášky
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
            Probíhá (Živý závod)
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Ukončen (Veřejný)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrátorská sekce</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Správa závodů
          </h1>
          <p className="text-sm text-slate-500">
            Zakládání závodů, konfigurace tratí, startovní listiny a řízení časomíry
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-5 h-5" />
          <span>Vytvořit nový závod</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filtrovat:</span>
        {[
          { label: 'Všechny závody', value: 'ALL' },
          { label: 'Příprava (DRAFT)', value: 'DRAFT' },
          { label: 'Probíhající (LIVE)', value: 'IN_PROGRESS' },
          { label: 'Ukončené (FINISHED)', value: 'FINISHED' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === f.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Races List */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredRaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Žádné závody</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Pro zvolený filtr nebyly nalezeny žádné záznamy.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-sm text-orange-600 font-semibold hover:underline"
          >
            <Plus className="w-4 h-4" />
            <span>Založit první závod</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map((race) => (
            <div
              key={race.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  {getStatusBadge(race.status)}
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

                <h3 className="font-bold text-lg text-slate-900 mb-2">{race.name}</h3>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
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

              {/* Actions Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/races/${race.id}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-orange-400" />
                    <span>Spravovat závod</span>
                  </Link>

                  {race.status === 'FINISHED' && (
                    <Link
                      to={`/results/${race.id}`}
                      target="_blank"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                      title="Otevřít veřejné výsledky"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                <div>
                  {deleteConfirmId === race.id ? (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleDeleteRace(race.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition"
                      >
                        Smazat
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition"
                      >
                        Zrušit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(race.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Smazat závod"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating race */}
      <CreateRaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchRaces()}
      />
    </div>
  );
};
