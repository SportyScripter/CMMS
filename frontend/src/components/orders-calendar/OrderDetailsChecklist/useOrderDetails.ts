import React, { useState, useEffect } from "react";
import { api } from "../../../api/axiosConfig";
import { User, Role } from "../../../types/auth";
import { useAuth } from "../../../context/AuthContext";
import { Machine } from "../../../types/machine";
import { OrderType } from "../../../types/order-calendar";

export interface EditTask {
  id?: number;
  task_description: string;
}

export const useOrderDetails = (
  orderId: number | null,
  isOpen: boolean,
  onClose: () => void,
  onUpdated: () => void,
) => {
  const { user } = useAuth();
  const currentUser = user as User;

  // --- DATA STATES ---
  const [order, setOrder] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);

  // --- EXECUTION STATES ---
  const [localOrderComments, setLocalOrderComments] = useState("");
  const [localChecklist, setLocalChecklist] = useState<any[]>([]);

  // --- EDIT MODE STATES ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOrderTypeId, setEditOrderTypeId] = useState<string>("");
  const [editMachineId, setEditMachineId] = useState<string>("");
  const [editAssignedRoleId, setEditAssignedRoleId] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");
  const [editScheduledDate, setEditScheduledDate] = useState("");

  const [editChecklistTasks, setEditChecklistTasks] = useState<EditTask[]>([]);
  const [tasksToDelete, setTasksToDelete] = useState<number[]>([]);
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);

  // --- UI STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // --- PERMISSIONS LOGIC ---
  const userRole = currentUser?.role?.name?.toLowerCase() || "";
  const ADMIN_ROLES = ["admin", "super admin", "kierownik", "dyrektor", "technik"];
  const TECH_ROLES = ["mechanik", "mechanik2", "elektryk", "automatyk"];

  const canEditGlobalDetails = ADMIN_ROLES.includes(userRole);

  const canExecuteTask = () => {
    if (!order) return false;
    if (canEditGlobalDetails) return true; 
    if (!TECH_ROLES.includes(userRole)) return false; 

    if (order.performed && order.performed.id !== currentUser.id) return false;
    if (order.assigned_role && order.assigned_role.name.toLowerCase() === userRole) return true;
    if (!order.assigned_role) return true;

    return false;
  };
  const isExecutionAllowed = canExecuteTask();

  // --- FETCH DATA ---
  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [orderRes, checklistRes] = await Promise.all([
        api.get(`/order-calendar/${orderId}`),
        api.get(`/order-checklist-items/order/${orderId}`),
      ]);
      const fetchedOrder = orderRes.data;
      setOrder(fetchedOrder);
      setLocalOrderComments(fetchedOrder.comments || "");
      setChecklist(checklistRes.data);
      setLocalChecklist(JSON.parse(JSON.stringify(checklistRes.data)));
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
      const [machinesRes, typesRes, rolesRes] = await Promise.all([
        api.get<Machine[]>("/machines"),
        api.get<OrderType[]>("/order-types"),
        api.get<Role[]>("/roles"),
      ]);
      setMachines(machinesRes.data);
      setOrderTypes(typesRes.data);
      setRolesList(rolesRes.data);

      setEditOrderTypeId(order.order_type?.id?.toString() || "");
      setEditMachineId(order.order_machine?.id?.toString() || "");
      setEditAssignedRoleId(order.assigned_role?.id?.toString() || ""); 
      setEditDescription(order.description || "");

      const date = new Date(order.scheduled_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setEditScheduledDate(date.toISOString().slice(0, 16));

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

  // --- SAVING CHANGES FROM EDIT MODE ---
  const saveEditedDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (tasksToDelete.length > 0) {
        await Promise.all(
          tasksToDelete.map((id) => api.delete(`/order-checklist-items/${id}`)),
        );
      }

      const tasksToAdd = editChecklistTasks.filter((t) => !t.id);
      if (tasksToAdd.length > 0) {
        await Promise.all(
          tasksToAdd.map((t) =>
            api.post("/order-checklist-items/", {
              order_calendar_id: order.id,
              task_description: t.task_description,
              status: "pending",
            }),
          ),
        );
      }

      let allTasksCompleted = true;
      if (editChecklistTasks.length === 0) {
        allTasksCompleted = false;
      } else {
        for (const task of editChecklistTasks) {
          if (!task.id) {
            allTasksCompleted = false;
            break;
          }
          const origTask = checklist.find((t: any) => t.id === task.id);
          if (!origTask || !["OK", "NOK", "ND"].includes(origTask.status)) {
            allTasksCompleted = false;
            break;
          }
        }
      }

      let nextStatus = order.status;
      if (allTasksCompleted && editChecklistTasks.length > 0) {
        nextStatus = "completed";
      } else if (!allTasksCompleted && order.status === "completed") {
        nextStatus = "un_completed";
      }

      const orderPayload = {
        order_type_id: Number(editOrderTypeId),
        description: editDescription.trim(),
        assigned_role_id: editAssignedRoleId
          ? Number(editAssignedRoleId)
          : null, 
        machine_id: editMachineId ? Number(editMachineId) : null,
        scheduled_date: new Date(editScheduledDate).toISOString(),
        status: nextStatus,
      };

      await api.patch(`/order-calendar/${order.id}`, orderPayload);

      onUpdated();
      setIsEditMode(false);
      fetchOrderDetails();
    } catch (err) {
      alert("Wystąpił błąd podczas zapisywania zmian.");
    } finally {
      setIsSaving(false);
    }
  };

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
      await api.patch(`/order-calendar/${order.id}`, {
        status: "in_progress",
        performed_id: Number(currentUser.id),
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

  return {
    currentUser,
    order,
    checklist,
    localOrderComments,
    setLocalOrderComments,
    localChecklist,
    isEditMode,
    setIsEditMode,
    editOrderTypeId,
    setEditOrderTypeId,
    editMachineId,
    setEditMachineId,
    editAssignedRoleId, 
    setEditAssignedRoleId,
    editDescription,
    setEditDescription,
    editScheduledDate,
    setEditScheduledDate,
    editChecklistTasks,
    isAddChecklistModalOpen,
    setIsAddChecklistModalOpen,
    machines,
    orderTypes,
    rolesList, 
    isLoading,
    isSaving,
    error,
    canEditGlobalDetails,
    isExecutionAllowed,
    allItemsProcessed,
    handleEnableEditMode,
    handleRemoveTaskInEdit,
    handleAddTasksFromModal,
    saveEditedDetails,
    handleChecklistExecutionUpdate,
    startOrder,
    saveExecutionProgress,
  };
};
