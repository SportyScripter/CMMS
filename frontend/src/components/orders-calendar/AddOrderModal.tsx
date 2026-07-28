import React, { useState, useEffect } from "react";
import {
  X,
  CalendarPlus,
  Save,
  Loader2,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { Machine } from "../../types/machine";
import { User } from "../../types/auth";
import { AddOrderModalProps, OrderType } from "../../types/order-calendar";
import { ManageOrderTypesModal } from "./ManageOrderTypesModal";

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  // --- FORM STATES ---
  const [orderTypeId, setOrderTypeId] = useState<string>("");
  const [machineId, setMachineId] = useState<string>("");
  const [performedId, setPerformedId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");

  const [scheduledDate, setScheduledDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // --- DATA STATES ---
  const [machines, setMachines] = useState<Machine[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- NESTED MODAL STATE ---
  const [isManageTypesModalOpen, setIsManageTypesModalOpen] = useState(false);

  // --- FETCH FORM DATA ---
  const fetchFormData = async () => {
    setIsLoadingData(true);
    try {
      const [machinesRes, typesRes, usersRes] = await Promise.all([
        api.get<Machine[]>("/machines"),
        api.get<OrderType[]>("/order-types"),
        api.get<User[]>("/users"),
      ]);
      setMachines(machinesRes.data);
      setOrderTypes(typesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError("Nie udało się załadować danych formularza.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFormData();
    } else {
      setOrderTypeId("");
      setMachineId("");
      setPerformedId("");
      setDescription("");
      setComments("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        order_type_id: Number(orderTypeId),
        description: description.trim(),
        principal_id: 0,
        performed_id: performedId ? Number(performedId) : null,
        machine_id: machineId ? Number(machineId) : null,
        comments: comments.trim() || null,
        scheduled_date: new Date(scheduledDate).toISOString(),
        status: "scheduled",
      };

      await api.post("/orders", payload);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Błąd podczas tworzenia zlecenia.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center text-lg">
              <CalendarPlus className="w-5 h-5 mr-2 text-blue-600" />
              Zaplanuj nowe zlecenie
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
              </div>
            )}

            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-sm text-gray-500">
                  Pobieranie danych...
                </span>
              </div>
            ) : (
              <form
                id="add-order-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typ zlecenia *
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        required
                        value={orderTypeId}
                        onChange={(e) => setOrderTypeId(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="" disabled>
                          Wybierz typ...
                        </option>
                        {orderTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsManageTypesModalOpen(true)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 rounded-lg transition-colors"
                        title="Zarządzaj typami zleceń"
                      >
                        <Settings2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data zaplanowania *
                    </label>
                    <input
                      required
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maszyna (opcjonalnie)
                    </label>
                    <select
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">-- Brak przypisanej maszyny --</option>
                      {machines.map((machine) => (
                        <option key={machine.id} value={machine.id}>
                          {machine.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Przypisany technik (opcjonalnie)
                    </label>
                    <select
                      value={performedId}
                      onChange={(e) => setPerformedId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">-- Przypisz później --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.lastname}{" "}
                          {user.role ? `(${user.role.name})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Krótki opis zadania *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="np. Wymiana łożysk na wale głównym..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uwagi dodatkowe
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Dodatkowe informacje, wskazówki BHP..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </form>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Anuluj
            </button>
            <button
              form="add-order-form"
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Zapisz zlecenie
            </button>
          </div>
        </div>
      </div>

      {/* --- NESTED MODAL (Manage Types) --- */}
      <ManageOrderTypesModal
        isOpen={isManageTypesModalOpen}
        onClose={() => setIsManageTypesModalOpen(false)}
        onUpdated={() => {
          fetchFormData();
          onUpdated();
        }}
      />
    </>
  );
};
