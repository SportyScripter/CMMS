import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Filter, CheckSquare, Square } from "lucide-react";
import { api } from "../../api/axiosConfig";
import { AddChecklistItemsModalProps } from "../../types/order-calendar";

export const AddChecklistItemsModal: React.FC<AddChecklistItemsModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  machines,
  orderTypes,
}) => {
  const [historicalOrders, setHistoricalOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //---FILTER STATE---
  const [filterMachine, setFilterMachine] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  //---SELECTION STATE---
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [customTask, setCustomTask] = useState<string>("");

  //Fetch all orders to extract historical checklist items
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

  // Clean state when opening
  useEffect(() => {
    if (isOpen) {
      selectedTasks.clear();
      setCustomTask("");
      setSearchQuery("");
    }
  }, [isOpen]);

  const availableTasks = useMemo(() => {
    const tasks = new Set<string>();
    historicalOrders.forEach((order) => {
      const matchMachine =
        filterMachine === "ALL" ||
        order.order_machine?.id?.toString() === filterMachine;
      const matchType =
        filterType === "ALL" || order.order_type?.id?.toString() === filterType;
      if (matchMachine && matchType && order.checklist_items) {
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
  }, [historicalOrders, filterMachine, filterType, searchQuery]);

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90bh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-lg">
            Dodaj element do listy kontrolnej
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30">
          {/*Custom Task Input*/}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stwórz własny krok
            </label>
            <form onSubmit={handleAddCustomTask} className="flex gap-2">
              <input
                type="text"
                placeholder="np. Sprawdzenie naciągu pasów napędowych"
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={!customTask.trim()}
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Dodaj
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              LUB WYBIERZ ISTNIEJĄCY
            </span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/*Filters*/}
          <div className=" flex flex-wrap gap-3 mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center text-gray-500 px-2">
              <Filter className="w-4 h-4 mr-2" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none flex-1 min-w-[150px]"
            >
              <option value="ALL">Wszystkie typy zleceń</option>
              {orderTypes.map((type) =>
                ((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))(type),
              )}
            </select>
            <select
              value={filterMachine}
              onChange={(e) => setFilterMachine(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none flex-1 min-w-[150px]"
            >
              <option value="ALL">Wszystkie maszyny</option>
              {machines.map((machine) =>
                ((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))(machine),
              )}
            </select>
            <div className="relative flex-1 min-w-[200px]">
              <search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50"
              />
            </div>
          </div>
          {/* LIST OF HISTORICAL TASKS */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Wczytywanie danych...
              </div>
            ) : availableTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Brak historycznych zadań spełniających kryteria
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[45vh] overflow-y-auto">
                {availableTasks.map((task, idx) => {
                  const isSelected = selectedTasks.has(task);
                  return (
                    <li
                      key={idx}
                      onClick={() => toggleTask(task)}
                      className={`flex items-start px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                    >
                      <div className="mt-0.5 mr-3 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${isSelected ? "text-gray-900 font-medium" : "text-gray-700"}`}
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
        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 pt-1.5 rounded-lg">
            Wybrano: {selectedTasks.size}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Zatwierdź wybór
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
