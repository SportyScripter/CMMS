import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Play,
  CheckCircle,
  Loader2,
  MessageSquare,
  Edit2,
  ShieldAlert,
  Calendar,
  ListChecks,
  Trash2,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { User } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";
import { Machine } from "../../types/machine";
import {
  OrderType,
  OrderDetailsChecklistModalProps,
} from "../../types/order-calendar";
import { AddChecklistItemsModal } from "./AddChecklistItemsModal";
import {
  getCalendarBadgeStyle,
  translateCalendarStatus,
} from "../../utils/statusUtils";

// Interface to track edited tasks (whether they existed in DB or are new)
interface EditTask {
  id?: number;
  task_description: string;
}

export const OrderDetailsChecklistModal: React.FC<
  OrderDetailsChecklistModalProps
> = ({ orderId, isOpen, onClose, onUpdated }) => {
  const { user } = useAuth();
  const currentUser = user as User;

  // --- DATA STATES ---
  const [order, setOrder] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);

  // --- EXECUTION STATES (Checking off on the shop floor) ---
  const [localOrderComments, setLocalOrderComments] = useState("");
  const [localChecklist, setLocalChecklist] = useState<any[]>([]);

  // --- EDIT MODE STATES (Order Management) ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOrderTypeId, setEditOrderTypeId] = useState<string>("");
  const [editMachineId, setEditMachineId] = useState<string>("");
  const [editPerformedId, setEditPerformedId] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");
  const [editScheduledDate, setEditScheduledDate] = useState("");

  // Checklist states in edit mode
  const [editChecklistTasks, setEditChecklistTasks] = useState<EditTask[]>([]);
  const [tasksToDelete, setTasksToDelete] = useState<number[]>([]);
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // --- UI STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // --- PERMISSIONS LOGIC ---
  const userRole = currentUser?.role?.name?.toLowerCase() || "";
  const ADMIN_ROLES = ["admin", "super admin", "kierownik"];
  const TECH_ROLES = ["mechanik", "elektryk", "automatyk"];

  const canEditGlobalDetails = ADMIN_ROLES.includes(userRole);

  const canExecuteTask = () => {
    if (!order) return false;
    if (canEditGlobalDetails) return true;
    if (!TECH_ROLES.includes(userRole)) return false;
    if (!order.performed) return true;
    if (order.performed.role?.name?.toLowerCase() === userRole) return true;
    return false;
  };

  const isExecutionAllowed = canExecuteTask();

  // --- FETCH DATA ---
  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [orderRes, checklistRes] = await Promise.all([
        // UPDATED ENDPOINTS based on Swagger
        api.get(`/order-calendar/${orderId}`),
        api.get(`/order-checklist-items/order/${orderId}`),
      ]);
      const fetchedOrder = orderRes.data;
      setOrder(fetchedOrder);
      setLocalOrderComments(fetchedOrder.comments || "");
      setChecklist(checklistRes.data);
      setLocalChecklist(JSON.parse(JSON.stringify(checklistRes.data))); // Deep copy
    } catch (err) {
      setError("Nie udało się pobrać szczegółów zlecenia.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && isOpen) {
      setIsEditMode(false);
      fetchOrderDetails();
    } else {
      setOrder(null);
      setLocalChecklist([]);
      setIsEditMode(false);
    }
  }, [orderId, isOpen]);

  // --- ENABLE EDIT MODE ---
  const handleEnableEditMode = async () => {
    setIsLoading(true);
    try {
      const [machinesRes, typesRes, usersRes] = await Promise.all([
        api.get<Machine[]>("/machines"),
        api.get<OrderType[]>("/order-types"),
        api.get<User[]>("/users"),
      ]);
      setMachines(machinesRes.data);
      setOrderTypes(typesRes.data);
      setUsersList(usersRes.data);

      setEditOrderTypeId(order.order_type?.id?.toString() || "");
      setEditMachineId(order.order_machine?.id?.toString() || "");
      setEditPerformedId(order.performed?.id?.toString() || "");
      setEditDescription(order.description || "");

      const date = new Date(order.scheduled_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setEditScheduledDate(date.toISOString().slice(0, 16));

      // Copy checklist to edit state
      setEditChecklistTasks(
        checklist.map((c) => ({
          id: c.id,
          task_description: c.task_description,
        })),
      );
      setTasksToDelete([]);

      setIsEditMode(true);
    } catch (err) {
      alert("Błąd pobierania danych do edycji.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CHECKLIST MANAGEMENT IN EDIT MODE ---
  const handleRemoveTaskInEdit = (index: number) => {
    const task = editChecklistTasks[index];
    if (task.id) {
      setTasksToDelete((prev) => [...prev, task.id!]);
    }
    setEditChecklistTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddTasksFromModal = (newTasksDesc: string[]) => {
    const newTasks = newTasksDesc.map((desc) => ({ task_description: desc }));
    setEditChecklistTasks((prev) => [...prev, ...newTasks]);
  };

  // --- SAVING CHANGES FROM EDIT MODE (With Smart Status Recalculation) ---
  const saveEditedDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Delete removed tasks (DELETE /order-checklist-items/{id})
      if (tasksToDelete.length > 0) {
        await Promise.all(
          tasksToDelete.map((id) => api.delete(`/order-checklist-items/${id}`)),
        );
      }

      // 2. Add newly created tasks (POST /order-checklist-items/)
      const tasksToAdd = editChecklistTasks.filter((t) => !t.id);
      if (tasksToAdd.length > 0) {
        await Promise.all(
          tasksToAdd.map((t) =>
            api.post("/order-checklist-items/", {
              order_calendar_id: order.id,
              task_description: t.task_description,
              status: "pending", // Default status for new tasks
            }),
          ),
        );
      }

      // 3. SMART STATUS EVALUATION
      let allTasksCompleted = true;
      if (editChecklistTasks.length === 0) {
        allTasksCompleted = false; // No tasks = can't auto-complete
      } else {
        for (const task of editChecklistTasks) {
          if (!task.id) {
            allTasksCompleted = false; // It's a new task, so it's 'pending'
            break;
          }
          // Check original status
          const origTask = checklist.find((t: any) => t.id === task.id);
          if (!origTask || !["OK", "NOK", "ND"].includes(origTask.status)) {
            allTasksCompleted = false;
            break;
          }
        }
      }

      // Determine next order status based on structural changes
      let nextStatus = order.status;
      if (allTasksCompleted && editChecklistTasks.length > 0) {
        nextStatus = "completed"; // All tasks remaining are marked done
      } else if (!allTasksCompleted && order.status === "completed") {
        nextStatus = "un_completed"; // Revert to in progress because pending tasks were added
      }

      // 4. Save basic order details and updated status (PATCH /order-calendar/{id})
      const orderPayload = {
        order_type_id: Number(editOrderTypeId),
        description: editDescription.trim(),
        performed_id: editPerformedId ? Number(editPerformedId) : null,
        machine_id: editMachineId ? Number(editMachineId) : null,
        scheduled_date: new Date(editScheduledDate).toISOString(),
        status: nextStatus,
      };

      await api.patch(`/order-calendar/${order.id}`, orderPayload);

      onUpdated();
      setIsEditMode(false);
      fetchOrderDetails(); // Refresh view with new data
    } catch (err) {
      alert("Wystąpił błąd podczas zapisywania zmian.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- EXECUTION LOGIC (For technicians) ---
  const handleChecklistExecutionUpdate = (
    itemId: number,
    field: string,
    value: string,
  ) => {
    setLocalChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const startOrder = async () => {
    if (!isExecutionAllowed) return;
    try {
      const assigneeId = order.performed?.id
        ? Number(order.performed.id)
        : Number(currentUser.id);

      await api.patch(`/order-calendar/${order.id}`, {
        status: "in_progress",
        performed_id: assigneeId,
      });

      fetchOrderDetails();
      onUpdated();
    } catch (err: any) {
      console.error(
        "Szczegóły błędu startu zlecenia:",
        err.response?.data || err,
      );
      alert("Błąd zmiany statusu. Sprawdź logi serwera.");
    }
  };

  const saveExecutionProgress = async (completeOrder: boolean = false) => {
    if (!isExecutionAllowed) return;
    setIsSaving(true);

    try {
      const orderUpdatePayload: any = { comments: localOrderComments };
      if (completeOrder) {
        orderUpdatePayload.status = "completed";
      }

      await api.patch(`/order-calendar/${order.id}`, orderUpdatePayload);

      const promises = localChecklist.map((item) =>
        api.patch(`/order-checklist-items/${item.id}`, {
          status: item.status,
          comments: item.comments,
        }),
      );
      await Promise.all(promises);

      onUpdated();
      if (completeOrder) {
        onClose();
      } else {
        fetchOrderDetails();
        alert("Zapisano postępy!");
      }
    } catch (err) {
      alert("Wystąpił błąd podczas zapisu postępów.");
    } finally {
      setIsSaving(false);
    }
  };

  const allItemsProcessed =
    localChecklist.length === 0 ||
    localChecklist.every((item) => ["OK", "NOK", "ND"].includes(item.status));

  if (!isOpen || !order) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] animate-in fade-in duration-200">
          {/* --- HEADER --- */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                Zlecenie #{order.id}
                <span
                  className={`ml-3 px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider border ${getCalendarBadgeStyle(
                    order.status,
                    order.scheduled_date,
                  )}`}
                >
                  {translateCalendarStatus(order.status)}
                </span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Maszyna:{" "}
                <span className="font-semibold text-gray-700">
                  {order.order_machine?.name || "Brak"}
                </span>{" "}
                | Typ:{" "}
                <span className="font-semibold text-gray-700">
                  {order.order_type?.name}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canEditGlobalDetails && !isEditMode && (
                <button
                  onClick={handleEnableEditMode}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center transition-colors shadow-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edytuj zlecenie
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg bg-white border border-gray-200 shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* --- MODAL BODY --- */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-gray-500">Pobieranie danych...</span>
              </div>
            ) : isEditMode ? (
              // ==========================================
              // VIEW 1: EDIT MODE (Full form)
              // ==========================================
              <form
                id="edit-order-form"
                onSubmit={saveEditedDetails}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6"
              >
                {/* Left column (60%): Basic order details */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center border-b border-gray-100 pb-2">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Edycja
                      parametrów zlecenia
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Typ zlecenia
                        </label>
                        <select
                          required
                          value={editOrderTypeId}
                          onChange={(e) => setEditOrderTypeId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="" disabled>
                            Wybierz typ...
                          </option>
                          {orderTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data zaplanowania
                        </label>
                        <input
                          required
                          type="datetime-local"
                          value={editScheduledDate}
                          onChange={(e) => setEditScheduledDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maszyna
                        </label>
                        <select
                          value={editMachineId}
                          onChange={(e) => setEditMachineId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="">
                            -- Brak przypisanej maszyny --
                          </option>
                          {machines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Przypisany technik
                        </label>
                        <select
                          value={editPerformedId}
                          onChange={(e) => setEditPerformedId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="">-- Przypisz później --</option>
                          {usersList.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} {u.lastname}{" "}
                              {u.role ? `(${u.role.name})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opis zadania
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Right column (40%): Checklist Edit */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <ListChecks className="w-5 h-5 mr-2 text-indigo-600" />{" "}
                      Karta Wykonawcza
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddChecklistModalOpen(true)}
                      className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      + Dodaj punkt
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1">
                    {editChecklistTasks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <ListChecks className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Brak punktów na checkliście.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {editChecklistTasks.map((task, idx) => (
                          <li
                            key={idx}
                            className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200 group"
                          >
                            <div className="flex-1 text-sm text-gray-800 pr-2 leading-tight">
                              <span className="font-medium text-gray-400 mr-2">
                                {idx + 1}.
                              </span>
                              {task.task_description}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTaskInEdit(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              // ==========================================
              // VIEW 2: EXECUTION MODE (For technicians)
              // ==========================================
              <div className="space-y-6">
                {!isExecutionAllowed && (
                  <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center shadow-sm">
                    <ShieldAlert className="w-6 h-6 mr-3 shrink-0 text-red-600" />
                    <p className="text-sm">
                      <strong>Brak uprawnień do realizacji.</strong> Zlecenie
                      jest przypisane do innej roli (
                      {order.performed?.role?.name || "innej"}).
                    </p>
                  </div>
                )}

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                    Informacje ogólne
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Opis zlecenia
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200 min-h-[45px] shadow-inner">
                        {order.description}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Komentarz ogólny (raport po przeglądzie)
                      </label>
                      <textarea
                        value={localOrderComments}
                        onChange={(e) => setLocalOrderComments(e.target.value)}
                        disabled={!isExecutionAllowed}
                        placeholder="Wpisz uwagi zbiorcze dotyczące całego zlecenia..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500 min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Karta Wykonawcza (Checklista)
                    </h4>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded text-gray-600">
                      Kroków: {localChecklist.length}
                    </span>
                  </div>

                  {localChecklist.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">
                      Brak elementów checklisty.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {localChecklist.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`p-5 transition-colors ${item.status === "NOK" ? "bg-red-50/30" : item.status === "OK" ? "bg-emerald-50/30" : "hover:bg-gray-50"}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                              <span className="font-bold text-gray-400 mr-2">
                                {idx + 1}.
                              </span>
                              <span className="font-semibold text-gray-800 text-sm md:text-base">
                                {item.task_description}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                disabled={!isExecutionAllowed}
                                onClick={() =>
                                  handleChecklistExecutionUpdate(
                                    item.id,
                                    "status",
                                    "OK",
                                  )
                                }
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50
                                  ${item.status === "OK" ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" : "bg-white text-gray-500 border-gray-300 hover:border-emerald-500 hover:text-emerald-600"}`}
                              >
                                OK
                              </button>
                              <button
                                disabled={!isExecutionAllowed}
                                onClick={() =>
                                  handleChecklistExecutionUpdate(
                                    item.id,
                                    "status",
                                    "NOK",
                                  )
                                }
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50
                                  ${item.status === "NOK" ? "bg-red-500 text-white border-red-600 shadow-sm" : "bg-white text-gray-500 border-gray-300 hover:border-red-500 hover:text-red-600"}`}
                              >
                                NOK
                              </button>
                              <button
                                disabled={!isExecutionAllowed}
                                onClick={() =>
                                  handleChecklistExecutionUpdate(
                                    item.id,
                                    "status",
                                    "ND",
                                  )
                                }
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50
                                  ${item.status === "ND" ? "bg-gray-600 text-white border-gray-700 shadow-sm" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500 hover:text-gray-700"}`}
                                title="Nie dotyczy"
                              >
                                ND
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 pl-6">
                            <div className="relative">
                              <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                disabled={!isExecutionAllowed}
                                value={item.comments || ""}
                                onChange={(e) =>
                                  handleChecklistExecutionUpdate(
                                    item.id,
                                    "comments",
                                    e.target.value,
                                  )
                                }
                                placeholder="Dodaj komentarz do tego punktu (opcjonalnie)..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60 transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- FOOTER ACTIONS --- */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            {!isEditMode ? (
              // Footer for Execution Mode
              <>
                <div className="text-sm text-gray-500 font-medium">
                  Przypisano:{" "}
                  {order.performed ? (
                    <span className="text-blue-600 font-bold">
                      {order.performed.name} {order.performed.lastname} (
                      {order.performed.role?.name})
                    </span>
                  ) : (
                    "Brak przypisanego technika"
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {order.status === "scheduled" && isExecutionAllowed && (
                    <button
                      onClick={startOrder}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Play className="w-5 h-5 mr-2" /> Rozpocznij pracę
                    </button>
                  )}

                  {order.status !== "scheduled" && isExecutionAllowed && (
                    <>
                      <button
                        onClick={() => saveExecutionProgress(false)}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Save className="w-5 h-5 mr-2" />
                        )}
                        Zapisz postępy
                      </button>

                      <button
                        onClick={() => saveExecutionProgress(true)}
                        disabled={isSaving || !allItemsProcessed}
                        title={
                          !allItemsProcessed
                            ? "Musisz określić status dla każdego punktu (OK/NOK/ND)"
                            : ""
                        }
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Zakończ zlecenie
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Footer for Edit Mode
              <div className="flex justify-end w-full gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
                >
                  Anuluj edycję
                </button>
                <button
                  form="edit-order-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors text-sm shadow-sm disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Zapisz strukturę zlecenia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal allowing to add checklist tasks in Edit Mode */}
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
