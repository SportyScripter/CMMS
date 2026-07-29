import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api/axiosConfig";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Filter,
  Plus,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { Order } from "../types/order-calendar";
import { AddOrderModal } from "../components/orders-calendar/AddOrderModal";

export const OrderCalendarPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<{ id: number; name: string }[]>([]);
  const [orderTypes, setOrderTypes] = useState<{ id: number; name: string }[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(""); 

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filterMachine, setFilterMachine] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [isManageTypesModalOpen, setIsManageTypesModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [ordersRes, machinesRes, typesRes] = await Promise.all([
        api.get<Order[]>("/order-calendar"),
        api.get("/machines"),
        api.get("/order-types"),
      ]);
      setOrders(ordersRes.data || []);
      setMachines(machinesRes.data || []);
      setOrderTypes(typesRes.data || []);
    } catch (err: any) {
      console.error("Błąd pobierania danych kalendarza:", err);
      setError(
        "Nie udało się pobrać danych. Sprawdź terminal backendu (możliwy błąd 500 przy ładowaniu relacji).",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); 
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(
        (o) =>
          filterMachine === "ALL" ||
          o.order_machine?.id?.toString() === filterMachine,
      )
      .filter(
        (o) =>
          filterType === "ALL" || o.order_type?.id?.toString() === filterType,
      )
      .sort(
        (a, b) =>
          new Date(a.scheduled_date).getTime() -
          new Date(b.scheduled_date).getTime(),
      );
  }, [orders, filterMachine, filterType]);

  const getCardStyle = (status: string, scheduledDate: string) => {
    if (status === "completed")
      return "bg-emerald-50 border-emerald-300 text-emerald-900 border-l-4 border-l-emerald-500";
    if (status === "in_progress")
      return "bg-yellow-50 border-yellow-300 text-yellow-900 border-l-4 border-l-yellow-500";
    if (isToday(new Date(scheduledDate)))
      return "bg-red-50 border-red-300 text-red-900 border-l-4 border-l-red-500";
    return "bg-gray-50 border-gray-200 text-gray-800 border-l-4 border-l-gray-400";
  };

  return (
    <div className="max-w-auto mx-auto space-y-1 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
            Harmonogram Zleceń
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Zarządzaj kalendarzem przeglądów i napraw na hali produkcyjnej.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Dodaj zlecenie
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={prevWeek}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="text-lg font-bold text-gray-900 w-48 text-center capitalize">
            {startOfWeek.toLocaleDateString("pl-PL", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button
            onClick={nextWeek}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Filtry:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Wszystkie typy</option>
            {orderTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={filterMachine}
            onChange={(e) => setFilterMachine(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Wszystkie maszyny</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${viewMode === "calendar" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> Kalendarz
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            <List className="w-4 h-4 mr-2" /> Lista
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[1000px] divide-x divide-gray-100">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`p-4 border-b border-gray-100 text-center ${isToday(day) ? "bg-blue-50/50" : "bg-gray-50"}`}
              >
                <div
                  className={`text-2xl font-bold ${isToday(day) ? "text-blue-600" : "text-gray-900"}`}
                >
                  {day.getDate()}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {day.toLocaleDateString("pl-PL", { weekday: "long" })}
                </div>
              </div>
            ))}

            {weekDays.map((day, i) => {
              const dayOrders = filteredOrders.filter((o) => {
                const orderDate = new Date(o.scheduled_date);
                return (
                  orderDate.getDate() === day.getDate() &&
                  orderDate.getMonth() === day.getMonth() &&
                  orderDate.getFullYear() === day.getFullYear()
                );
              });

              return (
                <div
                  key={i}
                  className={`min-h-[600px] p-2 space-y-2 ${isToday(day) ? "bg-blue-50/10" : ""}`}
                >
                  {dayOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 flex flex-col ${getCardStyle(order.status, order.scheduled_date)}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                        {order.order_type?.name || "Brak typu"}
                      </span>
                      <span className="text-sm font-semibold mb-2 line-clamp-2">
                        {order.description}
                      </span>
                      <div className="mt-auto text-xs opacity-70 font-medium">
                        {order.order_machine?.name || "Brak maszyny"}
                      </div>
                      <div className="text-xs opacity-70 mt-1 font-mono">
                        {new Date(order.scheduled_date).toLocaleTimeString(
                          "pl-PL",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-500 text-center py-12">Widok listy...</div>
        </div>
      )}

      {/* MODALS */}
      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onClose={() => setIsAddOrderModalOpen(false)}
        onUpdated={fetchData}
      />

      {/* 
        <OrderChecklistModal orderId={selectedOrderId} isOpen={selectedOrderId !== null} onClose={() => setSelectedOrderId(null)} onUpdated={fetchData} />
      */}
    </div>
  );
};
