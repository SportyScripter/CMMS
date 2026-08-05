import React from "react";
import { Wrench, Trash2, X } from "lucide-react";

interface FailureHeaderProps {
  failureId: number | null;
  canDeleteFailure: boolean;
  isActionLoading: boolean;
  onDelete: () => void;
  onClose: () => void;
}

export const FailureHeader: React.FC<FailureHeaderProps> = ({
  failureId,
  canDeleteFailure,
  isActionLoading,
  onDelete,
  onClose,
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      {/* LEFT SIDE: HEADER and DELETE BUTTON */}
      <div className="flex items-center gap-4">
        <h3 className="font-semibold text-gray-900 flex items-center text-lg">
          <Wrench className="w-5 h-5 text-blue-600 mr-2" />
          Szczegóły zgłoszenia #{failureId}
        </h3>

        {canDeleteFailure && (
          <button
            onClick={onDelete}
            disabled={isActionLoading}
            className="flex items-center text-sm px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Usuń zgłoszenie
          </button>
        )}
      </div>

      {/* RIGHT SIDE: Close button (X) */}
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};