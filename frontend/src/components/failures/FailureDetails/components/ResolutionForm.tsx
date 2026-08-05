import React from "react";
import { CheckCircle2, PackageSearch, Plus, Trash2, Loader2 } from "lucide-react";
import { Part } from "../../../../types/part";

interface ResolutionFormProps {
  handleResolve: (e: React.FormEvent) => void;
  repairDescription: string;
  setRepairDescription: (val: string) => void;
  isActionLoading: boolean;
  setIsResolving: (val: boolean) => void;
  usedParts: { part_id: number; quantity: number }[];
  availableParts: Part[];
  setIsPartModalOpen: (val: boolean) => void;
  updatePartField: (index: number, field: "quantity", value: number) => void;
  removePartField: (index: number) => void;
}

export const ResolutionForm: React.FC<ResolutionFormProps> = ({
  handleResolve,
  repairDescription,
  setRepairDescription,
  isActionLoading,
  setIsResolving,
  usedParts,
  availableParts,
  setIsPartModalOpen,
  updatePartField,
  removePartField,
}) => {
  return (
    <form
      onSubmit={handleResolve}
      className="border-t border-gray-200 pt-6 animate-in slide-in-from-bottom-2"
    >
      <h4 className="font-bold text-gray-900 flex items-center mb-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
        Raport z naprawy (Zamykanie / Edycja zgłoszenia)
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis wykonanych prac *
          </label>
          <textarea
            required
            rows={3}
            value={repairDescription}
            onChange={(e) => setRepairDescription(e.target.value)}
            placeholder="Opisz co zostało naprawione, wymienione, wyregulowane..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />
        </div>

        {/* List of used parts */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <PackageSearch className="w-4 h-4 mr-2 text-gray-500" />
              Zużyte części (opcjonalnie)
            </label>
            <button
              type="button"
              onClick={() => setIsPartModalOpen(true)}
              className="text-sm bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium flex items-center shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Dodaj część
            </button>
          </div>

          {/* List of selected parts */}
          <div className="space-y-2">
            {usedParts.map((up, index) => {
              const partInfo = availableParts.find((p) => p.id === up.part_id);
              return (
                <div
                  key={up.part_id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {partInfo?.name || "Nieznana część"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Magazyn: {partInfo?.quantity} szt. | QR:{" "}
                      {partInfo?.qr_code || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <span className="px-3 py-1.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
                        Ilość:
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={up.quantity}
                        onChange={(e) =>
                          updatePartField(index, "quantity", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1.5 text-sm text-center outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePartField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Usuń z listy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {usedParts.length === 0 && (
              <div className="text-center py-6 bg-white border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">
                  Nie wybrano jeszcze żadnych części.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setIsResolving(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={isActionLoading}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center shadow-sm text-sm disabled:opacity-70"
        >
          {isActionLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Zapisz i Zamknij Zgłoszenie
        </button>
      </div>
    </form>
  );
};