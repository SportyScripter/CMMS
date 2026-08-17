import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/axiosConfig";
import { Failure, Department } from "../types/failure";
import { Machine } from "../types/machine";
import { calculateDowntime } from "../utils/dateUtils";
import { AddFailureModal } from "../components/failures/AddFailureModal";
import { FailureDetailsModal } from "../components/failures/FailureDetails";
import { formatDateTime } from "../utils/dateUtils";
import {
  AlertTriangle,
  Filter,
  Plus,
  Clock,
  Wrench,
  Loader2,
  Archive,
  History,
  List,
  AlertCircle,
  Play,
  Calendar,
} from "lucide-react";
import {
  translateStatus,
  getStatusBadgeStyle,
  getStatusRowStyle,
} from "../utils/statusUtils";

export const FailureListPage = () => {
  // --- URL PARAMS ---
  const [searchParams] = useSearchParams();

  const initialDepartment = searchParams.get("department") || "ALL";

  // --- API DATA STATES ---
  const [failures, setFailures] = useState<Failure[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFailureId, setSelectedFailureId] = useState<number | null>(
    null,
  );

  // --- FILTER STATES ---
  const resolveStatusCategory = (rawStatus: string | null) => {
    if (!rawStatus || rawStatus === "active") return "ALL";
    
    const status = rawStatus.toUpperCase();
    if (["PENDING", "ACCEPTED"].includes(status)) return "NEW";
    if (status === "CRITICAL") return "CRITICAL";
    if (status === "WARNING") return "WARNING";
    if (["IN_PROGRESS", "WAITING_FOR_PARTS", "WAITING_FOR_SERVICE"].includes(status)) return "IN_PROGRESS";
    
    return "ALL";
  };

  const initialStatus = resolveStatusCategory(searchParams.get("status"));
  const [viewMode, setViewMode] = useState<"active" | "history">("active");
  const [machineFilter, setMachineFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartment);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [tick, setTick] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [failuresRes, machinesRes, deptsRes] = await Promise.all([
        api.get<Failure[]>("/failures"),
        api.get<Machine[]>("/machines"),
        api.get<Department[]>("/departments"),
      ]);
      setFailures(failuresRes.data);
      setMachines(machinesRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- INITIALIZATION EFFECT ---
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedFailures = useMemo(() => {
    const filtered = failures.filter((f) => {
      if (viewMode === "active" && f.status === "RESOLVED") return false;
      if (viewMode === "history" && f.status !== "RESOLVED") return false;

      if (machineFilter !== "ALL" && f.machine_id.toString() !== machineFilter)
        return false;
        
      if (
        departmentFilter !== "ALL" &&
        f.department_id.toString() !== departmentFilter
      )
        return false;

      if (viewMode === "active" && statusFilter !== "ALL") {
        if (
          statusFilter === "NEW" &&
          !["Pending", "ACCEPTED"].includes(f.status)
        )
          return false;
        if (statusFilter === "CRITICAL" && f.status !== "CRITICAL")
          return false;
        if (statusFilter === "WARNING" && f.status !== "WARNING") return false;
        if (
          statusFilter === "IN_PROGRESS" &&
          !["IN_PROGRESS", "WAITING_FOR_PARTS", "WAITING_FOR_SERVICE"].includes(
            f.status,
          )
        )
          return false;
      }

      if (viewMode === "history") {
        const failureDate = new Date(f.end_date || f.created_at).getTime();

        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          if (failureDate < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (failureDate > to.getTime()) return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (viewMode === "active") {
        const aIsCritical = a.status === "CRITICAL";
        const bIsCritical = b.status === "CRITICAL";
        if (aIsCritical && !bIsCritical) return -1;
        if (!aIsCritical && bIsCritical) return 1;
      }

      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      return dateB - dateA;
    });
  }, [
    failures,
    viewMode,
    machineFilter,
    departmentFilter,
    statusFilter,
    dateFrom,
    dateTo,
  ]);

  return (
    <div className="p-2 max-w-full mx-auto space-y-2">
      {/* --- MAIN HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            {viewMode === "active" ? (
              <>
                <Wrench className="w-8 h-8 mr-3 text-blue-600" /> Aktywne
                Zgłoszenia
              </>
            ) : (
              <>
                <Archive className="w-6 h-6 mr-3 text-gray-600" /> Historia
                Zgłoszeń (Zamknięte)
              </>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Zarządzaj awariami i przestojami. Znaleziono:{" "}
            {filteredAndSortedFailures.length} wpisów.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode("active")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "active"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-4 h-4 mr-2" /> Bieżące
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <History className="w-4 h-4 mr-2" /> Historia
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Zgłoś Awarię
          </button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 justify-between">
        <div className="flex-1">
          {viewMode === "active" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === "ALL"
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4 inline mr-1.5" /> Wszystkie
              </button>

              <button
                onClick={() => setStatusFilter("NEW")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === "NEW"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                Nowe / Oczekujące
              </button>

              <button
                onClick={() => setStatusFilter("CRITICAL")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === "CRITICAL"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                }`}
              >
                <AlertCircle className="w-4 h-4 inline mr-1.5" /> Awaria
              </button>

              <button
                onClick={() => setStatusFilter("WARNING")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === "WARNING"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-1.5" /> Utrudniona
                Prod.
              </button>

              <button
                onClick={() => setStatusFilter("IN_PROGRESS")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === "IN_PROGRESS"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                }`}
              >
                <Play className="w-4 h-4 inline mr-1.5" /> W trakcie
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200 w-fit">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2 ml-1" />
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Od:
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Do:
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t xl:border-t-0 xl:border-l border-gray-200 pt-4 xl:pt-0 xl:pl-4">
          <div className="flex items-center">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium"
            >
              <option value="ALL">Wszystkie Departamenty</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium"
          >
            <option value="ALL">Wszystkie Maszyny</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredAndSortedFailures.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900">
              {viewMode === "active"
                ? "Brak aktywnych awarii"
                : "Brak historii dla podanych kryteriów"}
            </p>
            <p className="text-gray-500">
              {viewMode === "active"
                ? "Wszystkie maszyny pracują poprawnie."
                : "Spróbuj zmienić filtry lub zakres dat."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4">Priorytet / Status</th>
                  <th className="px-6 py-4">Maszyna</th>
                  <th className="px-6 py-4">Zgłaszający</th>
                  <th className="px-6 py-4">Opis problemu</th>
                  {viewMode === "history" && (
                    <th className="px-6 py-4">Wykonał</th>
                  )}
                  <th className="px-6 py-4 text-center">Czas postoju</th>
                  <th className="px-6 py-4 text-center">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredAndSortedFailures.map((failure) => (
                  <tr
                    key={failure.id}
                    className={`transition-colors border-b border-gray-50/50 ${getStatusRowStyle(failure.status)}`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(failure.status)}`}
                      >
                        {translateStatus(failure.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {failure.machine.name}
                      <span className="block text-xs font-normal text-gray-500">
                        {failure.department.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {failure.submitter.name} {failure.submitter.lastname}
                      <span className="block text-xs text-gray-400">
                        {formatDateTime(failure.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="line-clamp-2 text-gray-700 max-w-xs"
                        title={failure.failure_description}
                      >
                        {failure.failure_description}
                      </p>
                    </td>
                    {viewMode === "history" && (
                      <td className="px-6 py-4">
                        {failure.recipient?.name} {failure.recipient?.lastname}
                        <span className="block text-xs text-gray-400">
                          {formatDateTime(failure.updated_at)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <div
                        className={`inline-flex items-center font-bold px-2 py-1 rounded-lg ${failure.status === "RESOLVED" ? "text-gray-500 bg-gray-50" : "text-red-600 bg-red-50"}`}
                      >
                        <Clock className="w-4 h-4 mr-1.5" />
                        {calculateDowntime(
                          failure.created_at,
                          failure.end_date,
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedFailureId(failure.id)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium inline-flex items-center transition-colors"
                      >
                        <Wrench className="w-4 h-4 mr-1.5" /> Otwórz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddFailureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
        machines={machines}
        departments={departments}
      />
      <FailureDetailsModal
        isOpen={selectedFailureId !== null}
        failureId={selectedFailureId}
        onClose={() => setSelectedFailureId(null)}
        onUpdated={fetchData}
      />
    </div>
  );
};