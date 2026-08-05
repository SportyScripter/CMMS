import React from "react";
import { CheckCircle2, Edit2, UserCheck, Eye } from "lucide-react";
import { Failure } from "../../../../types/failure";
import { Part } from "../../../../types/part";

interface ResolvedDetailsViewProps {
  failure: Failure;
  isManager: boolean;
  isService: boolean;
  setIsResolving: (val: boolean) => void;
  setSelectedPartForInfo: (part: Part | null) => void;
}

export const ResolvedDetailsView: React.FC<ResolvedDetailsViewProps> = ({
  failure,
  isManager,
  isService,
  setIsResolving,
  setSelectedPartForInfo,
}) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900 flex items-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
          Zakończono naprawę
        </h4>

        {/* Edit button for management */}
        {isManager && (
          <button
            type="button"
            onClick={() => setIsResolving(true)}
            className="text-xs bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edytuj zamknięte zgłoszenie
          </button>
        )}
      </div>

      <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-lg space-y-4">
        {/* Person who performed the repair */}
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center text-emerald-900 text-sm font-medium">
            <UserCheck className="w-4 h-4 mr-2 text-emerald-600" />
            Naprawione przez:
          </div>
          <span className="text-sm font-bold text-gray-900">
            {failure.recipient
              ? `${failure.recipient.name} ${failure.recipient.lastname}`
              : "Nieprzypisany"}
          </span>
        </div>

        {/* Description of performed work */}
        <div>
          <p className="text-xs text-emerald-800 uppercase font-semibold">
            Opis wykonanych prac
          </p>
          <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
            {failure.repair_description || "Brak opisu"}
          </p>
        </div>

        {/* List of used parts */}
        {isService && failure.used_parts && failure.used_parts.length > 0 && (
          <div className="pt-2 border-t border-emerald-200/50">
            <p className="text-xs text-emerald-800 uppercase font-semibold mb-2">
              Zużyte części (Kliknij, aby zobaczyć szczegóły):
            </p>
            <div className="space-y-1.5">
              {failure.used_parts.map((up, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPartForInfo(up.part)}
                  className="flex justify-between items-center bg-white/80 hover:bg-white p-2.5 rounded-lg border border-emerald-100/50 cursor-pointer transition-colors group shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-2 text-gray-400 group-hover:text-blue-600" />
                    {up.part.name}
                  </span>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {up.quantity_used} szt.
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};