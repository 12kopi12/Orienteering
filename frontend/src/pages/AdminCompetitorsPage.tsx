import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Competitor } from '../api/types';
import { AddCompetitorModal } from '../components/AddCompetitorModal';
import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react';

export const AdminCompetitorsPage: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);

  const fetchCompetitors = async (query = '') => {
    try {
      setLoading(true);
      const data = await api.competitors.list(query);
      setCompetitors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors(search);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Opravdu smazat tohoto závodníka z centrální evidence?')) return;
    try {
      await api.competitors.delete(id);
      fetchCompetitors(search);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při mazání závodníka');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Adresář & Evidence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Centrální evidence závodníků
          </h1>
          <p className="text-sm text-slate-500">
            Databáze běžců a oddílů pro rychlé přihlašování do závodů a kategorií
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCompetitor(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-5 h-5" />
          <span>Přidat závodníka</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-6 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Vyhledat podle jména, oddílu nebo reg. čísla..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />
      </div>

      {/* Competitors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 w-16 text-center">ID</th>
                <th className="py-3.5 px-4">Příjmení a Jméno</th>
                <th className="py-3.5 px-4">Oddíl / Klub</th>
                <th className="py-3.5 px-4">Registrační číslo</th>
                <th className="py-3.5 px-4 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </td>
                </tr>
              ) : competitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenalezen žádný závodník odpovídající hledání.
                  </td>
                </tr>
              ) : (
                competitors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.last_name} {c.first_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {c.club ? (
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">
                          {c.club}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">neuveden</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {c.reg_number || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingCompetitor(c);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Upravit závodníka"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Smazat závodníka"
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

      <AddCompetitorModal
        competitorToEdit={editingCompetitor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompetitor(null);
        }}
        onSuccess={() => fetchCompetitors(search)}
      />
    </div>
  );
};
