// src/components/failures/FailureDetailsModal.tsx
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
  Edit2,
  UserCheck,
  Eye,
  Save,
  Clock,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import {
  Failure,
  Department,
  FailureDetailsModalProps,
} from "../../types/failure";
import { Machine } from "../../types/machine";
import { Part } from "../../types/part";
import { useAuth } from "../../context/AuthContext";
import { calculateDowntime } from "../../utils/dateUtils";
import { PartSelectionModal } from "./PartSelectionModal";
import { PartInfoModal } from "./PartInfoModal";
import { StatusReasonModal } from "./StatusReasonModal";

export const FailureDetailsModal: React.FC<FailureDetailsModalProps> = ({
  failureId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const role = user?.role.name || "";

  // Check user permissions
  const isManager = ["Super Admin", "Admin", "Kierownik"].includes(role);
  const isService = [
    "Super Admin",
    "Admin",
    "Kierownik",
    "Mechanik",
    "Elektryk",
  ].includes(role);

  // Delete permission: Only managers can delete failures, not submitters or service personnel
  const canDeleteFailure = [
    "Super Admin",
    "Admin",
    "Dyrektor",
    "Kierownik",
  ].includes(role);

  // Data states
  const [failure, setFailure] = useState<Failure | null>(null);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Submitter Edit Mode states (For editing open failure description/machine/dept)
  const [isSubmitterEditing, setIsSubmitterEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editMachineId, setEditMachineId] = useState<number>(0);
  const [editDepartmentId, setEditDepartmentId] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>("CRITICAL");

  // Resolution form states (for closing or editing a closed failure)
  const [isResolving, setIsResolving] = useState(false);
  const [repairDescription, setRepairDescription] = useState("");
  const [usedParts, setUsedParts] = useState<
    { part_id: number; quantity: number }[]
  >([]);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "WAITING_FOR_PARTS" | "WAITING_FOR_SERVICE" | null
  >(null);

  // Modals for parts selection & part inspection
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedPartForInfo, setSelectedPartForInfo] = useState<Part | null>(
    null,
  );

  // Fetch failure details, parts, machines, and departments when modal opens
  useEffect(() => {
    if (isOpen && failureId) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError("");
        try {
          const [failureRes, partsRes, machinesRes, deptsRes] =
            await Promise.all([
              api.get<Failure>(`/failures/${failureId}`),
              api.get<Part[]>("/parts"),
              api.get<Machine[]>("/machines"),
              api.get<Department[]>("/departments"),
            ]);

          const fData = failureRes.data;
          setFailure(fData);
          setAvailableParts(partsRes.data);
          setMachines(machinesRes.data);
          setDepartments(deptsRes.data);

          // Pre-fill submitter edit form
          setEditDescription(fData.failure_description);
          setEditMachineId(fData.machine_id);
          setEditDepartmentId(fData.department_id);
          setEditStatus(fData.status);

          // Pre-fill repair details if already resolved
          setRepairDescription(fData.repair_description || "");
          if (fData.used_parts) {
            setUsedParts(
              fData.used_parts.map((p) => ({
                part_id: p.part_id,
                quantity: p.quantity_used,
              })),
            );
          }

          // Reset UI control states
          setIsSubmitterEditing(false);
          setIsResolving(false);
          setIsActionLoading(false);
        } catch (err) {
          setError("Failed to load failure details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, failureId]);

  if (!isOpen) return null;

  // Is current logged in user the author of this failure report?
  const isSubmitter = user?.id === failure?.submitter_id;

  // --- ACTIONS ---

  // Update status (e.g., to ACCEPTED, IN_PROGRESS, WAITING_FOR_PARTS)
  const handleStatusChange = async (newStatus: string, reason?: string) => {
    setIsActionLoading(true);
    setError("");
    try {
      const payload: any = {
        status: newStatus,
        recipient_id: user?.id,
      };

      if (reason) {
        payload.repair_description = reason;
      }

      await api.patch(`/failures/${failureId}`, payload);

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submitter saves edits to their open failure report
  const handleSaveSubmitterEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setError("");

    try {
      await api.patch(`/failures/${failureId}`, {
        failure_description: editDescription,
        machine_id: editMachineId,
        department_id: editDepartmentId,
        status: editStatus,
      });

      setIsSubmitterEditing(false);
      onUpdated();
      // Reload current modal view
      const updated = await api.get<Failure>(`/failures/${failureId}`);
      setFailure(updated.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to update failure details.",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Generalized delete function (used by both submitter and managers)
  const handleDeleteFailure = async () => {
    if (
      !window.confirm(
        "Czy na pewno chcesz usunąć to zgłoszenie? Tej operacji nie można cofnąć.",
      )
    ) {
      return;
    }

    setIsActionLoading(true);
    setError("");

    try {
      await api.delete(`/failures/${failureId}`);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Nie udało się usunąć zgłoszenia.",
      );
      setIsActionLoading(false);
    }
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!pendingStatus) return;

    await handleStatusChange(pendingStatus, reason);

    setIsReasonModalOpen(false);
    setPendingStatus(null);
  };

  // Submit repair resolution (End repair & consume parts) or update closed ticket
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairDescription.trim()) {
      setError("Repair description is required to close the issue.");
      return;
    }

    setIsActionLoading(true);
    setError("");

    try {
      // 1. Update failure status, description, and assignee
      await api.patch(`/failures/${failureId}`, {
        status: "RESOLVED",
        repair_description: repairDescription,
        end_date: failure?.end_date || new Date().toISOString(),
        recipient_id: failure?.recipient_id || user?.id,
      });

      // 2. Log consumed parts
      if (usedParts.length > 0) {
        await Promise.all(
          usedParts.map((p) =>
            api
              .post("/failure-parts/", {
                failure_id: failureId,
                part_id: p.part_id,
                quantity_used: p.quantity,
              })
              .catch(() => {
                // If already logged, update quantity
                return api.patch(`/failure-parts/${failureId}/${p.part_id}`, {
                  quantity_used: p.quantity,
                });
              }),
          ),
        );
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to close the failure.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- PARTS SELECTION LOGIC ---
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

  const updatePartField = (index: number, field: "quantity", value: number) => {
    const newParts = [...usedParts];
    newParts[index].quantity = value;
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
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900 flex items-center text-lg">
              <Wrench className="w-5 h-5 text-blue-600 mr-2" />
              Szczegóły zgłoszenia #{failureId}
            </h3>
            {/* Przycisk usuwania dla zarządzających */}
            {canDeleteFailure && (
              <button
                onClick={handleDeleteFailure}
                disabled={isActionLoading}
                className="flex items-center text-sm px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Usuń zgłoszenie
              </button>
            )}
          </div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Maszyna
                  </p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {failure.machine.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Zgłaszający
                  </p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {failure.submitter.name} {failure.submitter.lastname}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Czas postoju
                  </p>
                  <p className="font-bold text-red-600 mt-0.5">
                    {calculateDowntime(failure.created_at, failure.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Departament
                  </p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {failure.department.name}
                  </p>
                </div>
              </div>
              {/* SECTION: Issue Description & Submitter Editing */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Opis problemu (Zgłoszenie)
                  </p>

                  {/* Allow submitter to edit or delete if failure is still new */}
                  {isSubmitter &&
                    ["Pending", "CRITICAL", "WARNING"].includes(
                      failure.status,
                    ) &&
                    !isSubmitterEditing && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsSubmitterEditing(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edytuj
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteFailure}
                          disabled={isActionLoading}
                          className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Usuń
                        </button>
                      </div>
                    )}
                </div>

                {/* Submitter Edit Form */}
                {isSubmitterEditing ? (
                  <form
                    onSubmit={handleSaveSubmitterEdit}
                    className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Maszyna
                      </label>
                      <select
                        value={editMachineId}
                        onChange={(e) =>
                          setEditMachineId(Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none bg-white"
                      >
                        {machines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Departament
                      </label>
                      <select
                        value={editDepartmentId}
                        onChange={(e) =>
                          setEditDepartmentId(Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none bg-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Priorytet / Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none bg-white font-medium"
                      >
                        <option value="CRITICAL" className="text-red-600">
                          Awaria (Out of service)
                        </option>
                        <option value="WARNING" className="text-amber-600">
                          Produkcja utrudniona (Under maintenance)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Opis problemu
                      </label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none bg-white resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSubmitterEditing(false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-medium"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium flex items-center"
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3 mr-1" />
                        )}
                        Zapisz zmiany
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-red-50 text-red-900 rounded-lg text-sm border border-red-100 whitespace-pre-wrap">
                    {failure.failure_description}
                  </div>
                )}
              </div>{" "}
              {/* ACTION BUTTONS (For Mechanics / Service team) */}
              {!isResolving && failure.status !== "RESOLVED" && isService && (
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Akcje dla serwisu:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {/* ACCEPT FAILURE */}
                    {["Pending", "CRITICAL", "WARNING"].includes(
                      failure.status,
                    ) && (
                      <button
                        onClick={() => handleStatusChange("ACCEPTED")}
                        disabled={isActionLoading}
                        className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Przyjmij
                        zgłoszenie
                      </button>
                    )}

                    {/* WAITING FOR PARTS */}
                    {["ACCEPTED", "IN_PROGRESS"].includes(failure.status) && (
                      <button
                        onClick={() => {
                          setPendingStatus("WAITING_FOR_PARTS");
                          setIsReasonModalOpen(true);
                        }}
                        disabled={isActionLoading}
                        className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Oczekiwanie na części
                      </button>
                    )}
                    {/* WAITING FOR SERVICES */}
                    {["ACCEPTED", "IN_PROGRESS"].includes(failure.status) && (
                      <button
                        onClick={() => {
                          setPendingStatus("WAITING_FOR_SERVICE");
                          setIsReasonModalOpen(true);
                        }}
                        disabled={isActionLoading}
                        className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Oczekiwanie na serwis
                        zewnętrzny
                      </button>
                    )}

                    {/* STARTING REPAIR */}
                    {failure.status !== "IN_PROGRESS" && (
                      <button
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        disabled={isActionLoading}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                      >
                        <Play className="w-4 h-4 mr-2" /> Rozpocznij naprawę
                      </button>
                    )}

                    {/* ClOSE FAILURE */}
                    <button
                      onClick={() => setIsResolving(true)}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors text-sm shadow-sm ml-auto"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Zakończ naprawę
                    </button>
                  </div>
                </div>
              )}
              {/* RESOLUTION FORM (Closing or Editing a repair) */}
              {isResolving && isService && (
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

                      {/* List of selected parts */}
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
              )}
              {/* VIEW RESOLVED FAILURE DETAILS */}
              {failure.status === "RESOLVED" && !isResolving && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
                      Zakończono naprawę
                    </h4>

                    {/* Manager edit button for closed failures */}
                    {isManager && (
                      <button
                        type="button"
                        onClick={() => setIsResolving(true)}
                        className="text-xs bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium flex items-center transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edytuj
                        zamknięte zgłoszenie
                      </button>
                    )}
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-lg space-y-4">
                    {/* Display Who Closed the Failure */}
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

                    <div>
                      <p className="text-xs text-emerald-800 uppercase font-semibold">
                        Opis wykonanych prac
                      </p>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {failure.repair_description || "Brak opisu"}
                      </p>
                    </div>

                    {/* Consumed Parts List with Click-to-View Feature */}
                    {isService &&
                      failure.used_parts &&
                      failure.used_parts.length > 0 && (
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
              )}
            </div>
          )}
        </div>
      </div>
      <StatusReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        onSubmit={handleReasonSubmit}
        statusType={pendingStatus}
        isLoading={isActionLoading}
      />

      {/* Part Selector Modal */}
      {failure && (
        <PartSelectionModal
          isOpen={isPartModalOpen}
          onClose={() => setIsPartModalOpen(false)}
          onSelect={handleSelectPart}
          parts={availableParts}
          machineId={failure.machine_id}
        />
      )}

      {/* Part Info Preview Modal */}
      <PartInfoModal
        isOpen={selectedPartForInfo !== null}
        part={selectedPartForInfo}
        onClose={() => setSelectedPartForInfo(null)}
      />
    </div>
  );
};
