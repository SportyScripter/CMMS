import React, { useState, useEffect } from "react";
import {
  X,
  CalendarPlus,
  Save,
  Loader2,
  AlertCircle,
  Settings2,
  Trash2,
  ListChecks,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Machine } from "../../types/machine";
import { Role } from "../../types/auth"; 
import { AddOrderModalProps, OrderType } from "../../types/order-calendar";
import { ManageOrderTypesModal } from "./ManageOrderTypesModal";
import { AddChecklistItemsModal } from "./AddChecklistItemsModal";

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  // --- FORM STATES ---
  const [orderTypeId, setOrderTypeId] = useState<string>("");
  const [machineId, setMachineId] = useState<string>("");
  const [assignedRoleId, setAssignedRoleId] = useState<string>(""); 
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");

  const [scheduledDate, setScheduledDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // --- CHECKLIST STATE ---
  const [checklistTasks, setChecklistTasks] = useState<string[]>([]);

  // --- DATA STATES ---
  const [machines, setMachines] = useState<Machine[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); 

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- NESTED MODALS STATES ---
  const [isManageTypesModalOpen, setIsManageTypesModalOpen] = useState(false);
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);

  const fetchFormData = async () => {
    setIsLoadingData(true);
    try {
      const [machinesRes, typesRes, rolesRes] = await Promise.all([
        api.get<Machine[]>("/machines"),
        api.get<OrderType[]>("/order-types"),
        api.get<Role[]>("/roles"),
      ]);
      setMachines(machinesRes.data);
      setOrderTypes(typesRes.data);
      setRoles(rolesRes.data);
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
      setAssignedRoleId("");
      setDescription("");
      setComments("");
      setChecklistTasks([]);
      setError("");
    }
  }, [isOpen]);

  const removeTask = (indexToRemove: number) => {
    setChecklistTasks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddTasksFromModal = (newTasks: string[]) => {
    const combined = Array.from(new Set([...checklistTasks, ...newTasks]));
    setChecklistTasks(combined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. CREATE THE ORDER FIRST
      const orderPayload = {
        order_type_id: Number(orderTypeId),
        description: description.trim(),
        principal_id: 0,
        assigned_role_id: assignedRoleId ? Number(assignedRoleId) : null,
        machine_id: machineId ? Number(machineId) : null,
        comments: comments.trim() || null,
        scheduled_date: new Date(scheduledDate).toISOString(),
        status: "scheduled",
      };

      const orderResponse = await api.post("/order-calendar", orderPayload);
      const newOrderId = orderResponse.data.id; // Get generated ID

      // 2. CREATE ALL CHECKLIST ITEMS LINKED TO THIS ORDER
      if (checklistTasks.length > 0) {
        // Prepare promises for parallel execution to save time
        const itemPromises = checklistTasks.map((taskDesc) =>
          api.post("/order-checklist-items/", {
            order_calendar_id: newOrderId,
            task_description: taskDesc,
            status: "pending",
          }),
        );

        await Promise.all(itemPromises);
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Błąd podczas tworzenia zlecenia lub checklisty.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-fit overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[95vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
            <h3 className="font-semibold text-gray-900 flex items-center text-lg">
              <CalendarPlus className="w-5 h-5 mr-2 text-blue-600" />
              Zaplanuj nowe zlecenie z checklistą
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
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
                className="grid grid-cols-1 lg:grid-cols-6 gap-6"
              >
                {/* LEFT COLUMN: MAIN FORM */}
                <div className="lg:col-span-3 space-y-4">
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maszyna (opcjonalnie)
                      </label>
                      <select
                        value={machineId}
                        onChange={(e) => setMachineId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
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
                        Wydział / Rola (opcjonalnie)
                      </label>
                      <select
                        value={assignedRoleId}
                        onChange={(e) => setAssignedRoleId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                      >
                        <option value="">-- Przypisz później --</option>
                        {roles
                          .filter((role) =>
                            [
                              "elektryk",
                              "mechanik",
                              "automatyk",
                            ].includes(role.name.toLowerCase()),
                          )
                          .map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uwagi dodatkowe
                    </label>
                    <textarea
                      rows={2}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Dodatkowe informacje, wskazówki BHP..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                    />
                  </div>

                  {/* BUTTON: ADD CHECKLIST */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddChecklistModalOpen(true)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                      <ListChecks className="w-4 h-4 mr-2" /> Dodaj elementy
                      checklisty
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: CHECKLIST DISPLAY */}
                <div className="lg:col-span-3 bg-gray-50 rounded-xl border max-w-full border-gray-100 p-4 flex flex-col min-h-[300px] max-h-[55vh]">
                  <h4 className="font-semibold text-gray-900 mb-1 flex items-center border-b border-gray-200 pb-2">
                    <ListChecks className="w-4 h-4 mr-2 text-indigo-600" />{" "}
                    Karta Wykonawcza
                  </h4>

                  <div className="flex-1 mt-3 overflow-y-auto pr-1">
                    {checklistTasks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <ListChecks className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">
                          Brak dodanych kroków.
                          <br />
                          Użyj przycisku obok, aby stworzyć listę zadań.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {checklistTasks.map((task, idx) => (
                          <li
                            key={idx}
                            className="flex items-start bg-white p-3 rounded-lg border border-gray-200 shadow-sm group"
                          >
                            <div className="flex-1 text-lg text-gray-800 pr-2 leading-tight">
                              <span className="font-medium text-gray-400 mr-2">
                                {idx + 1}.
                              </span>
                              {task}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTask(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {checklistTasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs font-semibold text-gray-500 text-center">
                      Łącznie zadań: {checklistTasks.length}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* --- FOOTER ACTIONS --- */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              Anuluj
            </button>
            <button
              form="add-order-form"
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors disabled:opacity-70 text-sm shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Zapisz zlecenie i checklistę
            </button>
          </div>
        </div>
      </div>

      <ManageOrderTypesModal
        isOpen={isManageTypesModalOpen}
        onClose={() => setIsManageTypesModalOpen(false)}
        onUpdated={fetchFormData}
      />

      {/* MODAL CHECKLISTY */}
      <AddChecklistItemsModal
        isOpen={isAddChecklistModalOpen}
        onClose={() => setIsAddChecklistModalOpen(false)}
        onAdd={handleAddTasksFromModal}
        machines={machines}
        orderTypes={orderTypes}
      />
    </>
  );
};
