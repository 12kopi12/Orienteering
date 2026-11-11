import React, { useState, useEffect } from 'react';
import { Competitor } from '../api/types';
import { api } from '../api/client';
import { X, Search, UserPlus, Users, Hash, AlertCircle } from 'lucide-react';

interface AddEntryModalProps {
  categoryId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  categoryId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'existing' | 'new'>('existing');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null);

  // New competitor form
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [club, setClub] = useState<string>('');
  const [regNumber, setRegNumber] = useState<string>('');

  const [bibNumber, setBibNumber] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.competitors
        .list()
        .then((data) => setCompetitors(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCompetitors = competitors.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.club && c.club.toLowerCase().includes(search.toLowerCase())) ||
      (c.reg_number && c.reg_number.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (tab === 'existing') {
        if (!selectedCompId) {
          throw new Error('Vyberte závodníka ze seznamu');
        }
        await api.entries.create(categoryId, {
          competitor_id: selectedCompId,
          bib_number: bibNumber.trim() ? parseInt(bibNumber.trim(), 10) : undefined,
          note: note.trim() || undefined,
        });
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Zadejte jméno a příjmení nového závodníka');
        }
        await api.entries.create(categoryId, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          club: club.trim() || undefined,
          reg_number: regNumber.trim() || undefined,
          bib_number: bibNumber.trim() ? parseInt(bibNumber.trim(), 10) : undefined,
          note: note.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba při přihlašování');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-lg">Přihlásit závodníka do kategorie</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setTab('existing')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center space-x-2 transition ${
              tab === 'existing'
                ? 'border-orange-500 text-orange-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Vybrat z evidence</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('new')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center space-x-2 transition ${
              tab === 'new'
                ? 'border-orange-500 text-orange-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Založit nového</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Vyhledat a vybrat závodníka
              </label>
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Hledat jméno, klub nebo reg. číslo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {filteredCompetitors.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400">Žádný závodník nenalezen</p>
                ) : (
                  filteredCompetitors.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCompId(c.id)}
                      className={`p-2.5 px-3 flex items-center justify-between cursor-pointer text-sm transition ${
                        selectedCompId === c.id
                          ? 'bg-orange-50 text-orange-900 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span>{c.full_name}</span>
                        {c.club && (
                          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                            {c.club}
                          </span>
                        )}
                      </div>
                      {c.reg_number && (
                        <span className="text-xs text-slate-400 font-mono">{c.reg_number}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jméno *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Příjmení *</label>
                  <input
                    type="text"
                    required
                    placeholder="Novák"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Klub / Oddíl</label>
                  <input
                    type="text"
                    placeholder="např. ZBM"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Registrační číslo</label>
                  <input
                    type="text"
                    placeholder="např. ZBM9801"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Startovní číslo (volitelné)</span>
              </label>
              <input
                type="number"
                placeholder="Automaticky"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Poznámka</label>
              <input
                type="text"
                placeholder="volitelná poznámka"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg shadow transition disabled:opacity-50"
            >
              {submitting ? 'Přihlašuji...' : 'Přihlásit závodníka'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
