import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api/axiosConfig";
import { Failure, Department } from "../types/failure";
import { Machine } from "../types/machine";
import { calculateDowntime } from "../utils/dateUtils";
import { AddFailureModal } from "../components/failures/AddFailureModal";
import { FailureDetailsModal } from "../components/failures/FailureDetailsModal";
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

export const FailureListPage = () => {
  // --- API DATA STATES ---
  // Stores data fetched from the backend (failures, machines, departments)
  const [failures, setFailures] = useState<Failure[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATES ---
  // Controls the visibility of the Add/Edit modals and stores the selected failure ID
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFailureId, setSelectedFailureId] = useState<number | null>(
    null,
  );

  // --- FILTER STATES ---
  // viewMode: Toggles between active tickets and resolved history
  const [viewMode, setViewMode] = useState<"active" | "history">("active");
  // machineFilter & departmentFilter: Global dropdown filters
  const [machineFilter, setMachineFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  // statusFilter: Active view status badges (NEW, CRITICAL, etc.)
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, NEW, CRITICAL, WARNING, IN_PROGRESS
  // dateFrom & dateTo: History view date range filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- TIMER STATE ---
  // Forces a component re-render every 60 seconds to keep downtime calculations accurate
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- TABLE STYLING HELPERS ---
  // Returns appropriate Tailwind CSS badge colors based on the failure status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Close":
        return "bg-green-100 text-green-800 border-green-300";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "WARNING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ACCEPTED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  // Returns background hover colors for table rows based on status priority
  const getRowStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 hover:bg-amber-100";
      case "Close":
        return "bg-green-50 hover:bg-green-100";
      case "CRITICAL":
        return "bg-red-50 hover:bg-red-100";
      case "WARNING":
        return "bg-orange-50 hover:bg-orange-100";
      case "IN_PROGRESS":
        return "bg-amber-50 hover:bg-amber-100";
      case "ACCEPTED":
        return "bg-indigo-50 hover:bg-indigo-100";
      case "RESOLVED":
        return "bg-emerald-50 hover:bg-emerald-100";
      default:
        return "bg-white hover:bg-gray-50";
    }
  };
  // Translates raw backend status strings into human-readable Polish labels
  const translateStatus = (status: string) => {
    switch (status) {
      case "Pending":
        return "Oczekujące (Nowe)";
      case "Close":
        return "Zamknięte";
      case "CRITICAL":
        return "Awaria";
      case "WARNING":
        return "Utrudniona produkcja";
      case "IN_PROGRESS":
        return "W trakcie naprawy";
      case "ACCEPTED":
        return "Zgłoszenie przyjęte";
      case "RESOLVED":
        return "Zakończone";
      default:
        return status;
    }
  };

  // --- INTEGRATED FILTERING & SORTING LOGIC ---
  // This useMemo hook recalculates the list only when data or filter states change.
  const filteredAndSortedFailures = useMemo(() => {
    // STEP 1: FILTERING
    const filtered = failures.filter((f) => {
      // 1A. Filter by View Mode (Active vs. History)
      // Active view hides RESOLVED, History view only shows RESOLVED
      if (viewMode === "active" && f.status === "RESOLVED") return false;
      if (viewMode === "history" && f.status !== "RESOLVED") return false;

      // 1B. Apply Global Filters (Machine and Department dropdowns)
      if (machineFilter !== "ALL" && f.machine_id.toString() !== machineFilter)
        return false;
      if (
        departmentFilter !== "ALL" &&
        f.department_id.toString() !== departmentFilter
      )
        return false;

      // 1C. Apply Status Filters (Only applicable in the 'active' view)
      if (viewMode === "active" && statusFilter !== "ALL") {
        if (
          statusFilter === "NEW" &&
          !["Pending", "ACCEPTED"].includes(f.status)
        )
          return false;
        if (statusFilter === "CRITICAL" && f.status !== "CRITICAL")
          return false;
        if (statusFilter === "WARNING" && f.status !== "WARNING") return false;
        if (statusFilter === "IN_PROGRESS" && f.status !== "IN_PROGRESS")
          return false;
      }

      // 1D. Apply Date Range Filters (Only applicable in the 'history' view)
      if (viewMode === "history") {
        const failureDate = new Date(f.end_date || f.created_at).getTime();

        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          if (failureDate < from) return false;
        }
        if (dateTo) {
          // Set to the very end of the selected "To" date (23:59:59) to include all records from that day
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (failureDate > to.getTime()) return false;
        }
      }

      return true;
    });

    // STEP 2: SORTING
    return filtered.sort((a, b) => {
      // Priority 1: CRITICAL failures always take precedence at the top of the list
      const aIsCritical = a.status === "CRITICAL";
      const bIsCritical = b.status === "CRITICAL";
      if (aIsCritical && !bIsCritical) return -1;
      if (!aIsCritical && bIsCritical) return 1;

      // Priority 2: Older tickets appear first (meaning they have the longest downtime)
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
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
          {/* Active / History View Toggle Buttons */}
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

          {/* Add New Failure Button */}
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
        {/* LEFT SIDE: Status Badges OR Date Pickers (depending on current view mode) */}
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

        {/* RIGHT SIDE: Global Department and Machine Dropdowns */}
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
                  <th className="px-6 py-4 text-center">Czas postoju</th>
                  <th className="px-6 py-4 text-center">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredAndSortedFailures.map((failure) => (
                  <tr
                    key={failure.id}
                    className={`transition-colors border-b border-gray-50/50 ${getRowStyle(failure.status)}`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(failure.status)}`}
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
                        {new Date(failure.created_at).toLocaleString("pl-PL")}
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
