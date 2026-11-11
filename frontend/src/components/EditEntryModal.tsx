import React, { useState } from 'react';
import { RaceEntry, EntryStatus } from '../api/types';
import { X, Clock, AlertTriangle, Hash, FileText } from 'lucide-react';

interface EditEntryModalProps {
  entry: RaceEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<RaceEntry> & { result_time?: string }) => Promise<void>;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  entry,
  isOpen,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<EntryStatus>(entry.status);
  const [resultTime, setResultTime] = useState<string>(entry.result_time_formatted || '');
  const [bibNumber, setBibNumber] = useState<string>(entry.bib_number?.toString() || '');
  const [note, setNote] = useState<string>(entry.note || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave({
        status,
        result_time: resultTime.trim() || undefined,
        bib_number: bibNumber.trim() ? parseInt(bibNumber.trim(), 10) : undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Upravit záznam závodníka</h3>
            <p className="text-xs text-slate-300">
              {entry.competitor?.full_name} ({entry.competitor?.club || 'bez klubu'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Stav závodníka
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EntryStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="REGISTERED">Přihlášen (čeká na start)</option>
              <option value="RUNNING">Na trati (běží)</option>
              <option value="FINISHED">V cíli (platný čas)</option>
              <option value="DNF">DNF (Nedokončil / vzdal)</option>
              <option value="DISQ">DISK (Diskvalifikován - chybějící kontrola)</option>
              <option value="DNS">DNS (Nestartoval)</option>
            </select>
          </div>

          {/* Result Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center space-x-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Výsledný čas (MM:SS nebo HH:MM:SS)</span>
            </label>
            <input
              type="text"
              placeholder="např. 24:15 nebo 1:05:30"
              value={resultTime}
              onChange={(e) => setResultTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">
              Zadejte formát minuty:sekundy nebo celkový čas v sekundách.
            </p>
          </div>

          {/* Bib Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center space-x-1">
              <Hash className="w-4 h-4 text-slate-400" />
              <span>Startovní číslo</span>
            </label>
            <input
              type="number"
              value={bibNumber}
              onChange={(e) => setBibNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center space-x-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Poznámka (důvod disku / zranění)</span>
            </label>
            <input
              type="text"
              placeholder="např. chybějící kontrola č. 34"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Buttons */}
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
              disabled={saving}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg shadow transition disabled:opacity-50"
            >
              {saving ? 'Ukládám...' : 'Uložit změny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
