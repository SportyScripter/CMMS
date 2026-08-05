import React from "react";
import { Edit2, Trash2, Loader2, Save } from "lucide-react";
import { Failure, Department } from "../../../../types/failure";
import { Machine } from "../../../../types/machine";

interface SubmitterSectionProps {
  failure: Failure;
  isSubmitter: boolean;
  isSubmitterEditing: boolean;
  setIsSubmitterEditing: (val: boolean) => void;
  isActionLoading: boolean;
  handleDeleteFailure: () => void;
  handleSaveSubmitterEdit: (e: React.FormEvent) => void;
  
  // Form state for editing
  editMachineId: number;
  setEditMachineId: (val: number) => void;
  editDepartmentId: number;
  setEditDepartmentId: (val: number) => void;
  editStatus: string;
  setEditStatus: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  
  // Date for dropdowns
  machines: Machine[];
  departments: Department[];
}

export const SubmitterSection: React.FC<SubmitterSectionProps> = ({
  failure,
  isSubmitter,
  isSubmitterEditing,
  setIsSubmitterEditing,
  isActionLoading,
  handleDeleteFailure,
  handleSaveSubmitterEdit,
  editMachineId,
  setEditMachineId,
  editDepartmentId,
  setEditDepartmentId,
  editStatus,
  setEditStatus,
  editDescription,
  setEditDescription,
  machines,
  departments,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Opis problemu (Zgłoszenie)
        </p>

        {/* Edit/Delete buttons for the submitter (when the failure is new) */}
        {isSubmitter &&
          ["Pending", "CRITICAL", "WARNING"].includes(failure.status) &&
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

      {/* Edit form for operator */}
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
              onChange={(e) => setEditMachineId(Number(e.target.value))}
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
              onChange={(e) => setEditDepartmentId(Number(e.target.value))}
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
    </div>
  );
};