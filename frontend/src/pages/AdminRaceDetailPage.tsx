import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Race, RaceEntry, RaceStatus } from '../api/types';
import { LiveStopwatch } from '../components/LiveStopwatch';
import { EditEntryModal } from '../components/EditEntryModal';
import { AddEntryModal } from '../components/AddEntryModal';
import { AddCategoryModal } from '../components/AddCategoryModal';
import {
  Calendar,
  MapPin,
  Play,
  Square,
  CheckCircle,
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  ExternalLink,
  Flag,
  UserPlus,
} from 'lucide-react';

export const AdminRaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const raceId = parseInt(id || '0', 10);

  const [race, setRace] = useState<Race | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [entries, setEntries] = useState<RaceEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RaceEntry | null>(null);

  // Status prompt
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  const fetchRaceData = useCallback(async () => {
    try {
      const raceData = await api.races.get(raceId);
      setRace(raceData);

      if (raceData.categories && raceData.categories.length > 0) {
        setSelectedCatId((prev) => {
          if (prev && raceData.categories?.some((c) => c.id === prev)) {
            return prev;
          }
          return raceData.categories![0].id;
        });
      } else {
        setSelectedCatId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  const fetchEntries = useCallback(async (catId: number) => {
    try {
      const data = await api.entries.list(catId);
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchRaceData();
  }, [fetchRaceData]);

  useEffect(() => {
    if (selectedCatId) {
      fetchEntries(selectedCatId);
    } else {
      setEntries([]);
    }
  }, [selectedCatId, fetchEntries]);

  // Periodic refresh when race is in progress
  useEffect(() => {
    if (race?.status === 'IN_PROGRESS' && selectedCatId) {
      const timer = setInterval(() => {
        fetchEntries(selectedCatId);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [race?.status, selectedCatId, fetchEntries]);

  // Race status change
  const handleUpdateStatus = async (newStatus: RaceStatus) => {
    if (newStatus === 'FINISHED') {
      const confirm = window.confirm(
        'Opravdu si přejete závod ukončit? Závod se uzavře a oficiální výsledková listina bude ihned zveřejněna pro veřejnost.'
      );
      if (!confirm) return;
    }

    try {
      setStatusActionLoading(true);
      const updated = await api.races.updateStatus(raceId, newStatus);
      setRace(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při změně stavu');
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Stopwatch actions
  const handleStartRunner = async (entryId: number) => {
    try {
      const updated = await api.entries.start(entryId);
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při startu');
    }
  };

  const handleFinishRunner = async (entryId: number) => {
    try {
      const updated = await api.entries.finish(entryId);
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při doběhu');
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!window.confirm('Opravdu smazat tuto přihlášku?')) return;
    try {
      await api.entries.delete(entryId);
      if (selectedCatId) fetchEntries(selectedCatId);
      fetchRaceData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při mazání přihlášky');
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    if (!window.confirm('Opravdu smazat celou kategorii včetně všech přihlášených závodníků?')) return;
    try {
      await api.categories.delete(catId);
      fetchRaceData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při mazání kategorie');
    }
  };

  const handleSaveEntryEdit = async (data: Partial<RaceEntry> & { result_time?: string }) => {
    if (!editingEntry) return;
    const updated = await api.entries.update(editingEntry.id, data);
    setEntries((prev) => prev.map((e) => (e.id === editingEntry.id ? updated : e)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 mb-4">Závod nebyl nalezen.</p>
        <Link to="/admin" className="text-orange-600 font-semibold hover:underline">
          Zpět na správu závodů
        </Link>
      </div>
    );
  }

  const selectedCategory = race.categories?.find((c) => c.id === selectedCatId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět na seznam závodů</span>
        </Link>
      </div>

      {/* Race Top Card with State Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {race.status === 'DRAFT' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Stav: Příprava a registrace
                </span>
              )}
              {race.status === 'IN_PROGRESS' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Stav: Závod probíhá (Živé stopky)</span>
                </span>
              )}
              {race.status === 'FINISHED' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Stav: Ukončeno (Výsledky jsou veřejné)</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {race.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              {race.event_date && (
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(race.event_date).toLocaleString('cs-CZ')}</span>
                </div>
              )}
              {race.location && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{race.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Race Workflow Control Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {race.status === 'DRAFT' && (
              <button
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                disabled={statusActionLoading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Odstartovat závod (Spustit LIVE)</span>
              </button>
            )}

            {race.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateStatus('FINISHED')}
                disabled={statusActionLoading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Square className="w-4 h-4" />
                <span>Ukončit závod a zveřejnit výsledky</span>
              </button>
            )}

            {race.status === 'FINISHED' && (
              <>
                <Link
                  to={`/results/${race.id}`}
                  target="_blank"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow transition"
                >
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                  <span>Veřejná výsledkovka</span>
                </Link>
                <button
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={statusActionLoading}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition"
                  title="Vrátit stav zpět do běžícího v případě nutnosti doúprav"
                >
                  Znovu otevřít závod
                </button>
              </>
            )}
          </div>
        </div>

        {race.description && (
          <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-3xl">
            {race.description}
          </p>
        )}
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {race.categories && race.categories.length > 0 ? (
            race.categories.map((c) => {
              const isSelected = c.id === selectedCatId;
              return (
                <div key={c.id} className="relative group">
                  <button
                    onClick={() => setSelectedCatId(c.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span>{c.name}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 italic">Zatím nebyly vytvořeny žádné kategorie.</p>
          )}

          <button
            onClick={() => setIsAddCatOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat kategorii</span>
          </button>
        </div>

        {selectedCategory && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddEntryOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold shadow transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Přihlásit závodníka</span>
            </button>
            <button
              onClick={() => handleDeleteCategory(selectedCategory.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition"
              title="Smazat tuto kategorii"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Selected Category Details & Entries Table */}
      {selectedCategory ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Category specs ribbon */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-bold text-slate-900">
                Startovní listina & Časomíra: {selectedCategory.name}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                {selectedCategory.distance_km && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {selectedCategory.distance_km} km
                  </span>
                )}
                {selectedCategory.elevation_m && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    +{selectedCategory.elevation_m} m
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Přihlášeno běžců:{' '}
              <strong className="text-slate-800 font-mono">{entries.length}</strong>
            </div>
          </div>

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4 w-16 text-center">St.č.</th>
                  <th className="py-3 px-4">Závodník</th>
                  <th className="py-3 px-4">Klub / Oddíl</th>
                  <th className="py-3 px-4 text-center">Stav</th>
                  <th className="py-3 px-4 text-center">Časomíra / Živé stopky</th>
                  <th className="py-3 px-4 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="mb-2">V této kategorii zatím nejsou přihlášeni žádní závodníci.</p>
                      <button
                        onClick={() => setIsAddEntryOpen(true)}
                        className="text-xs font-bold text-orange-600 hover:underline inline-flex items-center space-x-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Přihlásit prvního závodníka</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      {/* Bib */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                        {entry.bib_number || '-'}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">
                          {entry.competitor?.full_name || 'Neznámý'}
                        </span>
                        {entry.competitor?.reg_number && (
                          <span className="ml-2 text-xs font-mono text-slate-400">
                            {entry.competitor.reg_number}
                          </span>
                        )}
                        {entry.note && (
                          <div className="text-xs text-slate-400 italic mt-0.5">{entry.note}</div>
                        )}
                      </td>

                      {/* Club */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {entry.competitor?.club ? (
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">
                            {entry.competitor.club}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {entry.status === 'REGISTERED' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                            Čeká na start
                          </span>
                        )}
                        {entry.status === 'RUNNING' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Na trati
                          </span>
                        )}
                        {entry.status === 'FINISHED' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            V cíli
                          </span>
                        )}
                        {entry.status === 'DNF' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                            DNF
                          </span>
                        )}
                        {entry.status === 'DISQ' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-900 text-white">
                            DISK
                          </span>
                        )}
                        {entry.status === 'DNS' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                            DNS
                          </span>
                        )}
                      </td>

                      {/* Timing & Stopwatches */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          {entry.status === 'REGISTERED' && (
                            <button
                              onClick={() => handleStartRunner(entry.id)}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Start</span>
                            </button>
                          )}

                          {entry.status === 'RUNNING' && (
                            <div className="flex items-center space-x-2">
                              <LiveStopwatch startedAt={entry.started_at} />
                              <button
                                onClick={() => handleFinishRunner(entry.id)}
                                className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
                              >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>Cíl / Stop</span>
                              </button>
                            </div>
                          )}

                          {entry.status === 'FINISHED' && (
                            <div className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 text-sm">
                              {entry.result_time_formatted || '-'}
                            </div>
                          )}

                          {(entry.status === 'DNF' ||
                            entry.status === 'DISQ' ||
                            entry.status === 'DNS') && (
                            <span className="text-xs text-slate-400 font-mono italic">
                              bez času ({entry.status})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Upravit čas / změnit stav"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Odebrat přihlášku"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Žádná kategorie</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Nejprve přidejte alespoň jednu kategorii (např. H21, D21, OPEN), abyste mohli registrovat
            závodníky a měřit časy.
          </p>
          <button
            onClick={() => setIsAddCatOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow hover:bg-orange-500 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Vytvořit první kategorii</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <AddCategoryModal
        raceId={raceId}
        isOpen={isAddCatOpen}
        onClose={() => setIsAddCatOpen(false)}
        onSuccess={() => fetchRaceData()}
      />

      {selectedCatId && (
        <AddEntryModal
          categoryId={selectedCatId}
          isOpen={isAddEntryOpen}
          onClose={() => setIsAddEntryOpen(false)}
          onSuccess={() => {
            fetchEntries(selectedCatId);
            fetchRaceData();
          }}
        />
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEntryEdit}
        />
      )}
    </div>
  );
};
