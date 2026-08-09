import { useState, useEffect, useMemo } from "react";
import { api } from "../api/axiosConfig";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Filter,
  Plus,
  AlertCircle,
  Eye,
  Users,
} from "lucide-react";
import { Order } from "../types/order-calendar";
import { AddOrderModal } from "../components/orders-calendar/AddOrderModal";
import { OrderDetailsChecklistModal } from "../components/orders-calendar/OrderDetailsChecklist";
import { useAuth } from "../context/AuthContext";
import { User, Role } from "../types/auth";
import {
  translateCalendarStatus,
  getCalendarBadgeStyle,
  getPriorityBadgeStyle,
  translatePriority,
} from "../utils/statusUtils";
import { formatDateTime } from "../utils/dateUtils";

export const OrderCalendarPage = () => {
  const { user } = useAuth();
  const currentUser = user as User;

  const userRole = currentUser?.role?.name?.toLowerCase() || "";
  const canAddOrder = [
    "admin",
    "super admin",
    "kierownik",
    "dyrektor",
  ].includes(userRole);

  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<{ id: number; name: string }[]>([]);
  const [orderTypes, setOrderTypes] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [roles, setRoles] = useState<Role[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- FILTERS ---
  const [filterMachine, setFilterMachine] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [ordersRes, machinesRes, typesRes, rolesRes] = await Promise.all([
        api.get<Order[]>("/order-calendar"),
        api.get("/machines"),
        api.get("/order-types"),
        api.get<Role[]>("/roles"),
      ]);
      setOrders(ordersRes.data || []);
      setMachines(machinesRes.data || []);
      setOrderTypes(typesRes.data || []);
      setRoles(rolesRes.data || []);
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
    const getStatusWeight = (status: string) => {
      const s = status.toLowerCase();
      if (s === "in_progress") return 1;
      if (s === "un_completed") return 2;
      if (s === "completed") return 4;
      return 3;
    };

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
      .filter(
        (o) =>
          filterRole === "ALL" ||
          o.assigned_role?.id?.toString() === filterRole,
      )
      .filter((o) => {
        if (viewMode !== "list") return true;

        const isCompleted = o.status.toLowerCase() === "completed";
        const dateStr =
          isCompleted && (o as any).updated_at
            ? (o as any).updated_at
            : o.scheduled_date;
        const refTime = new Date(dateStr).getTime();

        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          if (refTime < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (refTime > to.getTime()) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const weightA = getStatusWeight(a.status);
        const weightB = getStatusWeight(b.status);

        if (weightA !== weightB) {
          return weightA - weightB;
        }

        const isCompletedA = a.status.toLowerCase() === "completed";
        const isCompletedB = b.status.toLowerCase() === "completed";

        if (isCompletedA && isCompletedB) {
          const dateA = (a as any).updated_at
            ? new Date((a as any).updated_at).getTime()
            : new Date(a.scheduled_date).getTime();
          const dateB = (b as any).updated_at
            ? new Date((b as any).updated_at).getTime()
            : new Date(b.scheduled_date).getTime();
          return dateB - dateA;
        }

        return (
          new Date(a.scheduled_date).getTime() -
          new Date(b.scheduled_date).getTime()
        );
      });
  }, [
    orders,
    filterMachine,
    filterType,
    filterRole,
    viewMode,
    dateFrom,
    dateTo,
  ]);

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
          {canAddOrder && (
            <button
              onClick={() => setIsAddOrderModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Dodaj zlecenie
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        {/* Calendar navigation */}
        {viewMode === "calendar" ? (
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
        ) : (
          <div className="text-lg font-bold text-gray-900">
            Wszystkie zlecenia
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Filtry:</span>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">Wszystkie wydziały</option>
            {roles
              .filter((role) =>
                ["elektryk", "mechanik", "automatyk"].includes(
                  role.name.toLowerCase(),
                ),
              )
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>

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

          {/* Date filters only for list view */}
          {viewMode === "list" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 rounded-lg px-2 bg-white">
                <span className="text-xs text-gray-500 font-medium ml-1">
                  Od:
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm border-none focus:ring-0 py-1.5 px-2 outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg px-2 bg-white">
                <span className="text-xs text-gray-500 font-medium ml-1">
                  Do:
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm border-none focus:ring-0 py-1.5 px-2 outline-none bg-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
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
                className={`p-4 text-center transition-colors relative ${
                  isToday(day)
                    ? "bg-blue-50/70 border-b-2 border-blue-500 shadow-sm"
                    : "bg-gray-50 border-b border-gray-100"
                }`}
              >
                {isToday(day) && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                )}
                <div
                  className={`text-2xl font-bold ${isToday(day) ? "text-blue-700" : "text-gray-900"}`}
                >
                  {day.getDate()}
                </div>
                <div
                  className={`text-xs capitalize ${isToday(day) ? "text-blue-600 font-semibold" : "text-gray-500"}`}
                >
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
                  className={`min-h-[600px] p-2 space-y-2 ${
                    isToday(day) ? "bg-blue-50/40" : ""
                  }`}
                >
                  {dayOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 flex flex-col ${getCalendarBadgeStyle(order.status, order.scheduled_date)}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                          {order.order_type?.name || "Brak typu"}
                        </span>
                        <div className="flex items-center text-xs font-bold px-1.5 py-0.5 rounded bg-white/60 text-indigo-700 shadow-sm border border-indigo-100/50">
                          <Users className="w-3 h-3 mr-1" />
                          {order.assigned_role?.name || "Ogólne"}
                        </div>
                      </div>

                      <span className="text-sm font-semibold mb-2 line-clamp-2">
                        {order.description}
                      </span>

                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md border uppercase inline-block w-max ${getCalendarBadgeStyle(order.status, order.scheduled_date)}`}
                        >
                          {translateCalendarStatus(order.status)}
                        </span>
                        {order.priority && (
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-md border uppercase inline-block w-max ${getPriorityBadgeStyle(order.priority)}`}
                          >
                            {translatePriority(order.priority)}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-2 text-xs opacity-70 font-medium">
                        {order.order_machine?.name || "Brak maszyny"}
                      </div>
                      <div className="text-xs opacity-90 font-bold mt-1">
                        {formatDateTime(order.scheduled_date)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              Brak zleceń spełniających kryteria wyszukiwania.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Termin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Priorytet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Wydział
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Maszyna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Typ Zlecenia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Opis zadania
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDateTime(order.scheduled_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md border uppercase ${getCalendarBadgeStyle(order.status, order.scheduled_date)}`}
                        >
                          {translateCalendarStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.priority && (
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-md border uppercase ${getPriorityBadgeStyle(order.priority)}`}
                          >
                            {translatePriority(order.priority)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1.5 opacity-70" />
                          {order.assigned_role?.name || "Brak (Ogólne)"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {order.order_machine?.name || "Nie przypisano"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.order_type?.name || "Brak"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                        {order.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          Podgląd
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onClose={() => setIsAddOrderModalOpen(false)}
        onUpdated={fetchData}
      />

      <OrderDetailsChecklistModal
        orderId={selectedOrderId}
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        onUpdated={fetchData}
      />
    </div>
  );
};
