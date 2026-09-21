import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Filter, CheckSquare, Square, Trash2 } from "lucide-react";
import { api } from "../../api/axiosConfig";
import { AddChecklistItemsModalProps } from "../../types/order-calendar";

export const AddChecklistItemsModal: React.FC<AddChecklistItemsModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  machines,
  orderTypes,
  roles, 
  initialSelectedTasks = [],
}) => {
  const [historicalOrders, setHistoricalOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //---FILTER STATES---
  const [filterMachine, setFilterMachine] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterRole, setFilterRole] = useState<string>("ALL"); 
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [customTask, setCustomTask] = useState<string>("");

  useEffect(() => {
    if (isOpen && historicalOrders.length === 0) {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const res = await api.get("/order-calendar");
          setHistoricalOrders(res.data);
        } catch (err) {
          console.error("Błąd podczas pobierania zamówień:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isOpen, historicalOrders.length]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTasks(new Set(initialSelectedTasks));
      setCustomTask("");
      setSearchQuery("");
      setFilterRole("ALL"); 
      setFilterMachine("ALL");
      setFilterType("ALL");
    }
  }, [isOpen, initialSelectedTasks]);

  const availableTasks = useMemo(() => {
    const tasks = new Set<string>();
    historicalOrders.forEach((order) => {
      const matchMachine =
        filterMachine === "ALL" ||
        order.order_machine?.id?.toString() === filterMachine || 
        order.machine_id?.toString() === filterMachine;
        
      const matchType =
        filterType === "ALL" || 
        order.order_type?.id?.toString() === filterType || 
        order.order_type_id?.toString() === filterType;
        
      const matchRole =
        filterRole === "ALL" || 
        order.assigned_role?.id?.toString() === filterRole || 
        order.assigned_role_id?.toString() === filterRole;

      if (matchMachine && matchType && matchRole && order.checklist_items) {
        order.checklist_items.forEach((item: any) => {
          if (
            item.task_description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ) {
            tasks.add(item.task_description);
          }
        });
      }
    });
    return Array.from(tasks).sort();
  }, [historicalOrders, filterMachine, filterType, filterRole, searchQuery]);

  const toggleTask = (task: string) => {
    const newSet = new Set(selectedTasks);
    if (newSet.has(task)) newSet.delete(task);
    else newSet.add(task);
    setSelectedTasks(newSet);
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTask.trim()) return;

    const newSet = new Set(selectedTasks);
    newSet.add(customTask.trim());
    setSelectedTasks(newSet);
    setCustomTask("");
  };

  const handleConfirm = () => {
    onAdd(Array.from(selectedTasks));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <h3 className="font-semibold text-gray-900 text-lg">
            Dodaj elementy do listy kontrolnej
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 bg-gray-50/30 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[60vh] overflow-hidden">
          {/* LEFT COLUMN */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stwórz własny krok
              </label>
              <form onSubmit={handleAddCustomTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="np. Sprawdzenie naciągu pasów napędowych"
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!customTask.trim()}
                  className="px-4 py-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-medium rounded-lg transition-colors flex items-center disabled:opacity-50 text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Dodaj
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 mb-4 shrink-0">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                LUB WYBIERZ ISTNIEJĄCY
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* SEKCJA FILTRÓW */}
            <div className="flex flex-wrap gap-3 mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm shrink-0">
              <div className="flex items-center text-gray-500 px-2">
                <Filter className="w-4 h-4 mr-2" />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none flex-1 min-w-[140px]"
              >
                <option value="ALL">Wszystkie typy</option>
                {orderTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              
              {/* FILTR: Role/Departures */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none flex-1 min-w-[140px]"
              >
                <option value="ALL">Wszystkie wydziały</option>
                {roles
                  ?.filter((role) =>
                    ["elektryk", "mechanik", "automatyk"].includes(
                      role.name.toLowerCase()
                    )
                  )
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
              </select>

              <select
                value={filterMachine}
                onChange={(e) => setFilterMachine(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none flex-1 min-w-[140px]"
              >
                <option value="ALL">Wszystkie maszyny</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </select>
              <div className="relative flex-[2] min-w-[200px]">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hidden" />
                <input
                  type="text"
                  placeholder="Szukaj zadania..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 bg-gray-50"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Wczytywanie danych...
                </div>
              ) : availableTasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Brak historycznych zadań spełniających kryteria
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {availableTasks.map((task, idx) => {
                    const isSelected = selectedTasks.has(task);
                    return (
                      <li
                        key={idx}
                        onClick={() => toggleTask(task)}
                        className={`flex items-start px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                          isSelected
                            ? "bg-emerald-50/60 border-emerald-500"
                            : "hover:bg-gray-50 border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 mr-3 shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isSelected
                              ? "text-emerald-900 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {task}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <span className="font-semibold text-gray-700 text-sm">
                Wybrane elementy
              </span>
              <span className="bg-emerald-100 text-emerald-800 py-0.5 px-2.5 rounded-full text-xs font-bold">
                {selectedTasks.size}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-gray-50/30">
              {selectedTasks.size === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <CheckSquare className="w-8 h-8 mb-2 text-gray-200" />
                  <span className="text-sm">
                    Nie dodano jeszcze żadnych czynności.
                  </span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {Array.from(selectedTasks).map((task, idx) => (
                    <li
                      key={idx}
                      className="flex items-start justify-between p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg group transition-colors hover:border-red-200 hover:bg-red-50/30"
                    >
                      <span className="text-sm text-emerald-900 font-medium pr-4 break-words">
                        {task}
                      </span>
                      <button
                        onClick={() => toggleTask(task)}
                        className="text-gray-400 hover:text-red-600 transition-colors shrink-0 mt-0.5"
                        title="Usuń z listy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end items-center shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors text-sm shadow-sm"
            >
              Zatwierdź wybór
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};