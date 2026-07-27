import React, { useState, useEffect } from "react";
import {
  X,
  Wrench,
  CheckCircle2,
  Play,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  PackageSearch,
  TrashIcon,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Failure } from "../../types/failure";
import { Part } from "../../types/part";
import { useAuth } from "../../context/AuthContext";
import { calculateDowntime } from "../../utils/dateUtils";
import { PartSelectionModal } from "./PartSelectionModal";

interface FailureDetailsModalProps {
  failureId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const FailureDetailsModal: React.FC<FailureDetailsModalProps> = ({
  failureId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [failure, setFailure] = useState<Failure | null>(null);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [isResolving, setIsResolving] = useState(false);
  const [repairDescription, setRepairDescription] = useState("");
  const [usedParts, setUsedParts] = useState<
    { part_id: number; quantity: number }[]
  >([]);

  useEffect(() => {
    if (isOpen && failureId) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const [failureRes, partsRes] = await Promise.all([
            api.get<Failure>(`/failures/${failureId}`),
            api.get<Part[]>("/parts"),
          ]);
          setFailure(failureRes.data);
          setAvailableParts(partsRes.data);

          setIsResolving(false);
          setRepairDescription("");
          setUsedParts([]);
          setIsActionLoading(false);
        } catch (err: any) {
          setError(
            err.response?.data?.detail || "Failed to fetch failure details.",
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, failureId]);
  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: string) => {
    setIsActionLoading(true);
    setError("");
    try {
      await api.patch(`/failures/${failureId}`, {
        status: newStatus,
        recipient_id: user?.id,
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update status.");
    } finally {
      setIsActionLoading(false);
    }
  };
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairDescription.trim()) {
      setError("Repair description is required to resolve the failure.");
      return;
    }
    setIsActionLoading(true);
    setError("");
    try {
      await api.patch(`/failures/${failureId}`, {
        status: "RESOLVED",
        repair_description: repairDescription,
        end_date: new Date().toISOString(),
        recipient_id: user?.id,
      });
      if (usedParts.length > 0) {
        await Promise.all(
          usedParts.map((part) =>
            api.post("/failure-parts/", {
              failure_id: failureId,
              part_id: part.part_id,
              quantity_used: part.quantity,
            }),
          ),
        );
      }
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resolve failure.");
    } finally {
      setIsActionLoading(false);
    }
  };
  const handleSelectPart = (part: Part) => {
    const existingIndex = usedParts.findIndex((p) => p.part_id === part.id);

    if (existingIndex >= 0) {
      const newParts = [...usedParts];
      newParts[existingIndex].quantity += 1;
      setUsedParts(newParts);
    } else {
      setUsedParts([...usedParts, { part_id: part.id, quantity: 1 }]);
    }

    setIsPartModalOpen(false);
  };

  const addPartField = () => {
    setUsedParts([...usedParts, { part_id: 0, quantity: 1 }]);
  };
  const updatePartField = (
    index: number,
    field: "part_id" | "quantity",
    value: number,
  ) => {
    const newParts = [...usedParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setUsedParts(newParts);
  };
  const removePartField = (index: number) => {
    setUsedParts(usedParts.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center text-lg">
            <Wrench className="w-5 h-5 text-blue-600 mr-2" />
            Szczegóły zgłoszenia #{failureId}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {isLoading || !failure ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" /> {error}
                </div>
              )}

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Maszyna
                  </p>
                  <p className="font-medium text-gray-900">
                    {failure.machine.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Zgłaszający
                  </p>
                  <p className="font-medium text-gray-900">
                    {failure.submitter.name} {failure.submitter.lastname}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Czas postoju
                  </p>
                  <p className="font-bold text-red-600">
                    {calculateDowntime(failure.created_at, failure.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Departament
                  </p>
                  <p className="font-medium text-gray-900">
                    {failure.department.name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Opis problemu (Zgłoszenie)
                </p>
                <div className="p-3 bg-red-50 text-red-900 rounded-lg text-sm border border-red-100 whitespace-pre-wrap">
                  {failure.failure_description}
                </div>
              </div>

              {/* ACTION BUTTONS (Only if not resolved and not in resolution mode) */}
              {!isResolving && failure.status !== "RESOLVED" && (
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Akcje dla serwisu:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {failure.status === "Pending" && (
                      <button
                        onClick={() => handleStatusChange("ACCEPTED")}
                        disabled={isActionLoading}
                        className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Przyjmij
                        zgłoszenie
                      </button>
                    )}

                    {failure.status !== "IN_PROGRESS" && (
                      <button
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        disabled={isActionLoading}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm"
                      >
                        <Play className="w-4 h-4 mr-2" /> Rozpocznij naprawę
                      </button>
                    )}

                    <button
                      onClick={() => setIsResolving(true)}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors text-sm shadow-sm ml-auto"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Zakończ naprawę
                    </button>
                  </div>
                </div>
              )}

              {/* RESOLUTION FORM (Shown when technician clicks "Zakończ naprawę") */}
              {isResolving && (
                <form
                  onSubmit={handleResolve}
                  className="border-t border-gray-200 pt-6 animate-in slide-in-from-bottom-2"
                >
                  <h4 className="font-bold text-gray-900 flex items-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
                    Raport z naprawy (Zamykanie zgłoszenia)
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
                  </div>

                  {/* Parts Consumption Section */}
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

                    {/* Lista wybranych części */}
                    <div className="space-y-2">
                      {usedParts.map((up, index) => {
                        const partInfo = availableParts.find(
                          (p) => p.id === up.part_id,
                        );

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
                                  max={partInfo?.quantity}
                                  value={up.quantity}
                                  onChange={(e) =>
                                    updatePartField(
                                      index,
                                      "quantity",
                                      Number(e.target.value),
                                    )
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

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsResolving(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center shadow-sm disabled:opacity-70"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Zapisz i Zamknij Zgłoszenie
                    </button>
                  </div>
                </form>
              )}

              {/* History view for RESOLVED failures */}
              {failure.status === "RESOLVED" && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
                    Zakończono naprawę
                  </h4>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-emerald-800 uppercase font-semibold">
                        Opis naprawy
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {failure.repair_description || "Brak opisu"}
                      </p>
                    </div>
                    {failure.used_parts && failure.used_parts.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200/50">
                        <p className="text-xs text-emerald-800 uppercase font-semibold mb-2">
                          Zużyte części
                        </p>
                        <ul className="text-sm space-y-1">
                          {failure.used_parts.map((up, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center bg-white/60 px-2 py-1 rounded"
                            >
                              <span className="text-gray-800">
                                {up.part.name}
                              </span>
                              <span className="font-bold text-gray-600">
                                {up.quantity_used} szt.
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal wyboru części */}
      {failure && (
        <PartSelectionModal
          isOpen={isPartModalOpen}
          onClose={() => setIsPartModalOpen(false)}
          onSelect={handleSelectPart}
          parts={availableParts}
          machineId={failure.machine_id}
        />
      )}
    </div>
  );
};
