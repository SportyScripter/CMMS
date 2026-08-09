import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  CalendarDays,
  Loader2,
  AlertCircle,
  Clock,
  ArrowLeft,
  CheckSquare,
  User,
  Users,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Order, MachineOrdersModalProps } from "../../types/order-calendar";
import {
  translateCalendarStatus,
  getCalendarBadgeStyle,
  getPriorityBadgeStyle,
  translatePriority,
} from "../../utils/statusUtils";
import { formatDateTime, calculateDowntime } from "../../utils/dateUtils";

export const MachineOrdersModal: React.FC<MachineOrdersModalProps> = ({
  isOpen,
  onClose,
  machineId,
  machineName,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && machineId) {
      const fetchOrders = async () => {
        setIsLoading(true);
        setError("");
        try {
          const response = await api.get<Order[]>(
            `/order-calendar/machine/${machineId}`,
          );
          setOrders(response.data);
        } catch (err: any) {
          setError("Nie udało się pobrać listy zleceń z kalendarza.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    } else {
      setOrders([]);
      setSelectedOrder(null);
    }
  }, [isOpen, machineId]);

  const sortedOrders = useMemo(() => {
    const getStatusWeight = (status: string) => {
      const s = status.toLowerCase();
      if (s === "in_progress") return 1;
      if (s === "un_completed") return 2;
      if (s === "completed") return 4;
      return 3;
    };

    return [...orders].sort((a, b) => {
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
  }, [orders]);

  const handleClose = () => {
    setSelectedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center">
            {selectedOrder ? (
              <button
                onClick={() => setSelectedOrder(null)}
                className="mr-4 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <CalendarDays className="w-6 h-6 mr-3 text-indigo-600" />
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedOrder ? "Szczegóły zlecenia" : "Zlecenia i przeglądy"}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Maszyna:{" "}
                <span className="font-semibold text-gray-700">
                  {machineName}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
              <p>Pobieranie danych...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-6 text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : selectedOrder ? (
            // --- DETAIL VIEW ---
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div
                className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 ${getCalendarBadgeStyle(selectedOrder.status, selectedOrder.scheduled_date)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 font-bold text-sm rounded-lg border uppercase ${getCalendarBadgeStyle(selectedOrder.status, selectedOrder.scheduled_date)}`}
                    >
                      {translateCalendarStatus(selectedOrder.status)}
                    </span>
                    {selectedOrder.priority && (
                      <span
                        className={`px-3 py-1 font-bold text-sm rounded-lg border uppercase ${getPriorityBadgeStyle(selectedOrder.priority)}`}
                      >
                        {translatePriority(selectedOrder.priority)}
                      </span>
                    )}
                  </div>
                  {selectedOrder.scheduled_date && (
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      Termin:{" "}
                      <span className="text-gray-900 ml-1">
                        {formatDateTime(selectedOrder.scheduled_date)}
                      </span>
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedOrder.order_type.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  {selectedOrder.description || "Brak dodatkowego opisu."}
                </p>
              </div>

              {/* Information panel on the top */}
              {selectedOrder.started_at && (
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-sm flex flex-col md:flex-row flex-wrap gap-4 md:gap-8 items-start md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-indigo-900/60 font-bold block text-xs uppercase tracking-wider">
                        Realizuje
                      </span>
                      <span className="font-bold text-indigo-900 text-sm">
                        {selectedOrder.performed?.name}{" "}
                        {selectedOrder.performed?.lastname}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-blue-900/60 font-bold block text-xs uppercase tracking-wider">
                        Rozpoczęto
                      </span>
                      <span className="font-bold text-blue-900 text-sm">
                        {formatDateTime(selectedOrder.started_at)}
                      </span>
                    </div>
                  </div>

                  {selectedOrder.completed_at && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-emerald-900/60 font-bold block text-xs uppercase tracking-wider">
                          Zakończono
                        </span>
                        <span className="font-bold text-emerald-900 text-sm">
                          {formatDateTime(selectedOrder.completed_at)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedOrder.started_at && selectedOrder.completed_at && (
                    <div className="flex items-center gap-3 md:ml-auto">
                      <div className="p-2 bg-gray-200 rounded-lg text-gray-700">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-gray-500 font-bold block text-xs uppercase tracking-wider">
                          Czas trwania
                        </span>
                        <span className="font-bold text-gray-800 text-sm">
                          {calculateDowntime(
                            selectedOrder.started_at,
                            selectedOrder.completed_at,
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Wydział
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {selectedOrder.assigned_role?.name || "Ogólne (Brak)"}
                    </p>
                  </div>
                </div>

                {/* Column 2: Principal */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Zleceniodawca
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {selectedOrder.principal?.name}{" "}
                      {selectedOrder.principal?.lastname || "Brak danych"}
                    </p>
                    {selectedOrder.principal?.role?.name && (
                      <p className="text-xs text-gray-400">
                        Stanowisko: {selectedOrder.principal?.role.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Opis zlecenia
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {selectedOrder.description || "Brak dodatkowego opisu."}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Dodatkowe informacje / uwagi
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {selectedOrder.comments || "Brak uwag."}
                  </p>
                </div>
              </div>

              {/* Checklist section */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-gray-900 font-bold mb-4 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-indigo-500" />
                  Checklista przeglądu
                </h4>

                {selectedOrder.checklist_items &&
                selectedOrder.checklist_items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.checklist_items.map((item, idx) => {
                      let rowStyle = "bg-gray-50 border-gray-200";
                      let badgeStyle =
                        "bg-gray-200 text-gray-700 border-gray-300";

                      if (item.status === "OK") {
                        rowStyle = "bg-emerald-50 border-emerald-200";
                        badgeStyle =
                          "bg-emerald-100 text-emerald-800 border-emerald-300";
                      } else if (item.status === "NOK") {
                        rowStyle = "bg-red-50 border-red-200";
                        badgeStyle = "bg-red-100 text-red-800 border-red-300";
                      } else if (item.status === "ND") {
                        rowStyle = "bg-gray-50 border-gray-200";
                        badgeStyle =
                          "bg-gray-200 text-gray-800 border-gray-300";
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 p-3 rounded-lg border shadow-sm transition-colors ${rowStyle}`}
                        >
                          <div className="shrink-0 mt-0.5">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-md border uppercase ${badgeStyle}`}
                            >
                              {item.status || "BRAK"}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {item.task_description}
                            </span>
                            {item.comments && (
                              <span className="text-xs text-gray-600 mt-1.5">
                                <span className="font-medium text-gray-500">
                                  Uwagi:
                                </span>{" "}
                                {item.comments}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Brak dedykowanych zadań (checklisty) dla tego przeglądu.
                  </p>
                )}
              </div>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Brak zaplanowanych zleceń dla tej maszyny.
              </p>
            </div>
          ) : (
            // --- LIST VIEW ---
            <div className="space-y-3">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-indigo-400 group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-3 py-1 font-bold text-sm rounded-lg border uppercase ${getCalendarBadgeStyle(order.status, order.scheduled_date)}`}
                      >
                        {translateCalendarStatus(order.status)}
                      </span>

                      {order.priority && (
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md border uppercase ${getPriorityBadgeStyle(order.priority)}`}
                        >
                          {translatePriority(order.priority)}
                        </span>
                      )}

                      <span className="flex items-center text-xs font-bold px-1.5 py-0.5 rounded bg-white border border-gray-200 text-indigo-600 shadow-sm">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {order.assigned_role?.name || "Brak (Ogólne)"}
                      </span>

                      {order.scheduled_date && (
                        <span className="text-xs text-gray-500 flex items-center ml-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Termin: {formatDateTime(order.scheduled_date)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {order.order_type?.name || "Brak tytułu"}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 rotate-180 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
