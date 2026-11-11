import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Competitor } from '../api/types';
import { X, User, AlertCircle } from 'lucide-react';

interface AddCompetitorModalProps {
  competitorToEdit?: Competitor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (comp: Competitor) => void;
}

export const AddCompetitorModal: React.FC<AddCompetitorModalProps> = ({
  competitorToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [club, setClub] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (competitorToEdit) {
      setFirstName(competitorToEdit.first_name);
      setLastName(competitorToEdit.last_name);
      setClub(competitorToEdit.club || '');
      setRegNumber(competitorToEdit.reg_number || '');
    } else {
      setFirstName('');
      setLastName('');
      setClub('');
      setRegNumber('');
    }
  }, [competitorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('Jméno a příjmení jsou povinná pole');
      }

      let result: Competitor;
      if (competitorToEdit) {
        result = await api.competitors.update(competitorToEdit.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          club: club.trim() || null,
          reg_number: regNumber.trim() || null,
        });
      } else {
        result = await api.competitors.create({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          club: club.trim() || null,
          reg_number: regNumber.trim() || null,
        });
      }

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání závodníka');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-lg">
              {competitorToEdit ? 'Upravit závodníka' : 'Nový závodník'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Klub / Zkratka oddílu</label>
            <input
              type="text"
              placeholder="např. ZBM"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Registrační číslo</label>
            <input
              type="text"
              placeholder="např. ZBM9801"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
              {submitting ? 'Ukládám...' : 'Uložit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
