import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { RaceResultsResponse } from '../api/types';
import {
  Trophy,
  Calendar,
  MapPin,
  Printer,
  ArrowLeft,
  Medal,
  Award,
  AlertCircle,
  Flag,
} from 'lucide-react';

export const PublicResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RaceResultsResponse | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const raceId = parseInt(id, 10);
    api.results
      .get(raceId)
      .then((res) => {
        setData(res);
        if (res.categories.length > 0) {
          setSelectedCatId(res.categories[0].category.id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-1">Výsledky nejsou dostupné</h2>
          <p className="text-sm text-red-600 mb-4">{error || 'Závod nebyl nalezen nebo ještě nebyl ukončen.'}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zpět na přehled závodů</span>
          </Link>
        </div>
      </div>
    );
  }

  const { race, categories } = data;
  const currentCategoryData = categories.find((c) => c.category.id === selectedCatId) || categories[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-container">
      {/* Back button & Print header */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-sm text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět na seznam závodů</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm transition"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Vytisknout výsledky</span>
        </button>
      </div>

      {/* Race Title Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>Oficiální výsledková listina</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {race.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
            {race.event_date && (
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(race.event_date)}</span>
              </div>
            )}
            {race.location && (
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{race.location}</span>
              </div>
            )}
          </div>
        </div>

        {race.description && (
          <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-3xl">
            {race.description}
          </p>
        )}
      </div>

      {/* Category Tabs */}
      {categories.length > 0 ? (
        <div>
          <div className="no-print flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
            {categories.map((catResult) => {
              const isSelected = catResult.category.id === selectedCatId;
              return (
                <button
                  key={catResult.category.id}
                  onClick={() => setSelectedCatId(catResult.category.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{catResult.category.name}</span>
                  <span
                    className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {catResult.finishers_count}/{catResult.total_participants}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Category Results Table */}
          {currentCategoryData && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              {/* Category Info Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    Kategorie {currentCategoryData.category.name}
                  </h2>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 font-medium">
                    {currentCategoryData.category.distance_km && (
                      <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        Délka: <strong>{currentCategoryData.category.distance_km} km</strong>
                      </span>
                    )}
                    {currentCategoryData.category.elevation_m && (
                      <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        Převýšení: <strong>{currentCategoryData.category.elevation_m} m</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Celkem přihlášeno: <strong>{currentCategoryData.total_participants}</strong> | Dokončilo:{' '}
                  <strong>{currentCategoryData.finishers_count}</strong>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4 w-16 text-center">Poř.</th>
                      <th className="py-3 px-4 w-16 text-center">St.č.</th>
                      <th className="py-3 px-4">Jméno a příjmení</th>
                      <th className="py-3 px-4">Oddíl / Klub</th>
                      <th className="py-3 px-4 text-right">Čas</th>
                      <th className="py-3 px-4 text-right">Ztráta</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentCategoryData.results.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          V této kategorii zatím nejsou žádné záznamy.
                        </td>
                      </tr>
                    ) : (
                      currentCategoryData.results.map((res, index) => {
                        return (
                          <tr
                            key={index}
                            className={`hover:bg-slate-50/80 transition ${
                              res.rank === 1 ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3 px-4 text-center font-bold font-mono">
                              {res.rank === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 text-xs shadow-sm" title="1. místo">
                                  <Medal className="w-3.5 h-3.5" />
                                </span>
                              ) : res.rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs shadow-sm" title="2. místo">
                                  <Award className="w-3.5 h-3.5" />
                                </span>
                              ) : res.rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/70 text-white text-xs shadow-sm" title="3. místo">
                                  <Award className="w-3.5 h-3.5" />
                                </span>
                              ) : res.rank !== null ? (
                                `${res.rank}.`
                              ) : (
                                '-'
                              )}
                            </td>

                            {/* Bib */}
                            <td className="py-3 px-4 text-center font-mono text-slate-500 font-medium">
                              {res.bib_number || '-'}
                            </td>

                            {/* Name */}
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {res.competitor?.full_name || 'Neznámý závodník'}
                              {res.competitor?.reg_number && (
                                <span className="ml-2 text-xs font-normal text-slate-400 font-mono">
                                  ({res.competitor.reg_number})
                                </span>
                              )}
                            </td>

                            {/* Club */}
                            <td className="py-3 px-4 font-mono font-medium text-slate-700">
                              {res.competitor?.club ? (
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">
                                  {res.competitor.club}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>

                            {/* Result Time */}
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {res.result_time_formatted || '-'}
                            </td>

                            {/* Gap */}
                            <td className="py-3 px-4 text-right font-mono text-xs text-slate-500">
                              {res.gap || '-'}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-center">
                              {res.status === 'FINISHED' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                  OK
                                </span>
                              ) : res.status === 'DNF' ? (
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800"
                                  title={res.note || 'Vzdal / Nedokončil'}
                                >
                                  DNF
                                </span>
                              ) : res.status === 'DISQ' ? (
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-900 text-white"
                                  title={res.note || 'Diskvalifikován'}
                                >
                                  DISK
                                </span>
                              ) : res.status === 'DNS' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                                  DNS
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">{res.status}</span>
                              )}
                              {res.note && (
                                <div className="text-[11px] text-slate-500 italic mt-0.5">
                                  {res.note}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Tento závod nemá zadané žádné kategorie.
        </div>
      )}
    </div>
  );
};
