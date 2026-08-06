import React from "react";
import { Calendar, ListChecks, Trash2 } from "lucide-react";
import { Machine } from "../../../../types/machine";
import { OrderType } from "../../../../types/order-calendar";
import { User } from "../../../../types/auth";
import { EditTask } from "../useOrderDetails";

interface OrderEditFormProps {
  saveEditedDetails: (e: React.FormEvent) => void;
  editOrderTypeId: string;
  setEditOrderTypeId: (val: string) => void;
  editScheduledDate: string;
  setEditScheduledDate: (val: string) => void;
  editMachineId: string;
  setEditMachineId: (val: string) => void;
  editPerformedId: string;
  setEditPerformedId: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  orderTypes: OrderType[];
  machines: Machine[];
  usersList: User[];
  editChecklistTasks: EditTask[];
  handleRemoveTaskInEdit: (index: number) => void;
  setIsAddChecklistModalOpen: (val: boolean) => void;
}

export const OrderEditForm: React.FC<OrderEditFormProps> = ({
  saveEditedDetails,
  editOrderTypeId,
  setEditOrderTypeId,
  editScheduledDate,
  setEditScheduledDate,
  editMachineId,
  setEditMachineId,
  editPerformedId,
  setEditPerformedId,
  editDescription,
  setEditDescription,
  orderTypes,
  machines,
  usersList,
  editChecklistTasks,
  handleRemoveTaskInEdit,
  setIsAddChecklistModalOpen,
}) => {
  return (
    <form
      id="edit-order-form"
      onSubmit={saveEditedDetails}
      className="grid grid-cols-1 lg:grid-cols-5 gap-6"
    >
      {/* Left column (60%): Basic order details */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center border-b border-gray-100 pb-2">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Edycja parametrów zlecenia
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ zlecenia</label>
              <select
                required
                value={editOrderTypeId}
                onChange={(e) => setEditOrderTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="" disabled>Wybierz typ...</option>
                {orderTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data zaplanowania</label>
              <input
                required
                type="datetime-local"
                value={editScheduledDate}
                onChange={(e) => setEditScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maszyna</label>
              <select
                value={editMachineId}
                onChange={(e) => setEditMachineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">-- Brak przypisanej maszyny --</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Przypisany technik</label>
              <select
                value={editPerformedId}
                onChange={(e) => setEditPerformedId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">-- Przypisz później --</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.lastname} {u.role ? `(${u.role.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opis zadania</label>
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

      {/* Right column (40%): Edit Checklist */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <ListChecks className="w-5 h-5 mr-2 text-indigo-600" /> Karta Wykonawcza
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
                    <span className="font-medium text-gray-400 mr-2">{idx + 1}.</span>
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
  );
};