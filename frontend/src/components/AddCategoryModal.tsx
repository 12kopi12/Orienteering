import React, { useState } from 'react';
import { api } from '../api/client';
import { Category } from '../api/types';
import { X, Flag, AlertCircle } from 'lucide-react';

interface AddCategoryModalProps {
  raceId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cat: Category) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  raceId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [elevationM, setElevationM] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error('Název kategorie je povinný');
      }

      const cat = await api.categories.create(raceId, {
        name: name.trim().toUpperCase(),
        distance_km: distanceKm.trim() ? parseFloat(distanceKm.trim()) : undefined,
        elevation_m: elevationM.trim() ? parseInt(elevationM.trim(), 10) : undefined,
      });

      onSuccess(cat);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba při vytváření kategorie');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-lg">Přidat kategorii</h3>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Název kategorie *
            </label>
            <input
              type="text"
              required
              placeholder="např. H21, D21, OPEN"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Délka tratě (km)</label>
              <input
                type="number"
                step="0.1"
                placeholder="např. 4.2"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Převýšení (m)</label>
              <input
                type="number"
                placeholder="např. 120"
                value={elevationM}
                onChange={(e) => setElevationM(e.target.value)}
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
              {submitting ? 'Přidávám...' : 'Přidat kategorii'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
