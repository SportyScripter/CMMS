import React from "react";
import { Part } from "../../../types/part";
import { X, Wrench, Loader2 } from "lucide-react";

interface PartCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: Part | null;
  compatibleMachines: any[];
  isLoading: boolean;
}

export const PartCompatibilityModal: React.FC<PartCompatibilityModalProps> = ({
  isOpen,
  onClose,
  part,
  compatibleMachines,
  isLoading,
}) => {
  if (!isOpen || !part) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <h3 className="font-semibold text-gray-900 flex items-center text-base">
            <Wrench className="w-5 h-5 text-emerald-600 mr-2" />
            Kompatybilne urządzenia dla: {part.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : compatibleMachines.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">
              Ta część nie została przypisana do żadnego urządzenia.
            </p>
          ) : (
            compatibleMachines.map((item) => (
              <div
                key={`${item.part_id}-${item.machine_id}`}
                className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex flex-col"
              >
                <span className="font-medium text-gray-900 text-sm">
                  {item.machine.name}
                </span>
                {item.machine.location && (
                  <span className="text-xs text-gray-500 mt-0.5">
                    Lokalizacja: {item.machine.location}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};