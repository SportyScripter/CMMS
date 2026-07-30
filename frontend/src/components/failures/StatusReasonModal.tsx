import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';

interface StatusReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  statusType: 'WAITING_FOR_PARTS' | 'WAITING_FOR_SERVICE' | null;
  isLoading?: boolean;
}

export const StatusReasonModal: React.FC<StatusReasonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  statusType,
  isLoading = false 
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !statusType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
    }
  };

  const title = statusType === 'WAITING_FOR_PARTS' 
    ? 'Oczekiwanie na części' 
    : 'Oczekiwanie na serwis z zewnątrz';

  const placeholder = statusType === 'WAITING_FOR_PARTS' 
    ? 'Wpisz jakich części brakuje, np. "Zamówiono łożyska stożkowe SKF, dostawa we wtorek..."'
    : 'Wpisz szczegóły, np. "Wezwano serwis producenta maszyny, czekamy na przyjazd..."';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Powód i przewidywany czas (wymagane) *
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm bg-gray-50/50"
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium flex items-center transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Zapisywanie...' : <><Save className="w-4 h-4 mr-2" /> Potwierdź status</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};