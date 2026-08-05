import { useState, useEffect } from "react";
import { api } from "../../../api/axiosConfig";
import { Failure, Department, FailureDetailsModalProps } from "../../../types/failure";
import { Machine } from "../../../types/machine";
import { Part } from "../../../types/part";
import { useAuth } from "../../../context/AuthContext";

export const useFailureDetails = ({
  failureId,
  isOpen,
  onClose,
  onUpdated,
}: FailureDetailsModalProps) => {
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

  return {
    // States and permissions
    failure, availableParts, machines, departments,
    isLoading, isActionLoading, error,
    isManager, isService, canDeleteFailure, isSubmitter,
    
    // Edit mode for submitters
    isSubmitterEditing, setIsSubmitterEditing,
    editDescription, setEditDescription,
    editMachineId, setEditMachineId,
    editDepartmentId, setEditDepartmentId,
    editStatus, setEditStatus,
    
    // Resolution mode for closing failures
    isResolving, setIsResolving,
    repairDescription, setRepairDescription,
    usedParts,
    isReasonModalOpen, setIsReasonModalOpen,
    pendingStatus, setPendingStatus,
    
    // Part modals
    isPartModalOpen, setIsPartModalOpen,
    selectedPartForInfo, setSelectedPartForInfo,

    // Functions
    handleStatusChange,
    handleSaveSubmitterEdit,
    handleDeleteFailure,
    handleReasonSubmit,
    handleResolve,
    handleSelectPart,
    updatePartField,
    removePartField,
  };
};