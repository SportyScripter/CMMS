import React, { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Machine } from "../../types/machine";
import { Department } from "../../types/failure";
import { useAuth } from "../../context/AuthContext";

interface AddFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  machines: Machine[];
  departments: Department[];
}

export const AddFailureModal: React.FC<AddFailureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  machines,
  departments,
}) => {
  const { user } = useAuth();
  const [machineId, setMachineId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  // Default status mapping to standard priorities
  const [status, setStatus] = useState("CRITICAL");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // POST request matching the FailureCreate schema.
      // submitter_id is handled by backend via current_user.
      await api.post("/failures", {
        machine_id: Number(machineId),
        department_id: Number(departmentId),
        failure_description: description,
        status: status,
        submitter_id: user?.id,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const errDetail = err.response?.data?.detail;
      if (Array.isArray(errDetail)) {
        // Jeśli to błąd 422, wyciągnij czytelny tekst
        setError(
          errDetail
            .map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`)
            .join(", "),
        );
      } else {
        setError(errDetail || "Failed to submit failure report.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <h3 className="font-semibold text-gray-900 flex items-center text-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Report Machine Failure
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Machine
            </label>
            <select
              required
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="" disabled>
                Select broken machine...
              </option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.location ? `(${m.location})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority / Status
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible Department
            </label>
            <select
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="" disabled>
                Assign to...
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, error codes, unusual sounds, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
