import React, { useState, useEffect } from "react";
import { api } from "../api/axiosConfig";
import { Failure, Department } from "../types/failure";
import { Machine } from "../types/machine";
import { calculateDowntime } from "../utils/dateUtils";
import { AddFailureModal } from "../components/failures/AddFailureModal";
import { FailureDetailsModal } from "../components/failures/FailureDetailsModal";
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Clock,
  Wrench,
  Loader2,
} from "lucide-react";

export const FailureListPage = () => {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFailureId, setSelectedFailureId] = useState<number | null>(
    null,
  );

  // Filters state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ACTIVE"); // ACTIVE = not resolved
  const [filterDept, setFilterDept] = useState("");

  // Timer state to force re-render every minute for accurate downtime
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
    // Update the UI every 60 seconds to refresh downtime calculations
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- FILTERING & SORTING LOGIC ---
  const activeStatuses = [
    "Pending",
    "Close",
    "CRITICAL",
    "WARNING",
    "ACCEPTED",
    "IN_PROGRESS",
  ];

  const filteredAndSortedFailures = failures
    .filter((f) => {
      // Filter by status
      if (filterStatus === "ACTIVE") return activeStatuses.includes(f.status);
      if (filterStatus && f.status !== filterStatus) return false;
      // Filter by department
      if (filterDept && f.department_id.toString() !== filterDept) return false;
      return true;
    })
    .sort((a, b) => {
      // 1st Priority: CRITICAL (Awaria) always goes to the top
      const aIsCritical = a.status === "CRITICAL";
      const bIsCritical = b.status === "CRITICAL";
      if (aIsCritical && !bIsCritical) return -1;
      if (!aIsCritical && bIsCritical) return 1;

      // 2nd Priority: Longest downtime (oldest created_at comes first)
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    });

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            Zgłoszenia Awarii
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Zarządzaj bieżącymi awariami i przestojami maszyn.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Filter className="w-4 h-4 mr-2" /> Filtruj
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1" /> Zgłoś Awarię
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {isFilterOpen && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status zgłoszenia
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ACTIVE">Tylko bieżące (Niezakończone)</option>
                <option value="CRITICAL">Awaria Krytyczna</option>
                <option value="IN_PROGRESS">W trakcie naprawy</option>
                <option value="RESOLVED">Historia (Zakończone)</option>
                <option value="">Wszystkie statusy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Departament
              </label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Wszystkie departamenty</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredAndSortedFailures.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900">
              Brak aktywnych awarii
            </p>
            <p className="text-gray-500">
              Wszystkie maszyny pracują poprawnie.
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
                      <div className="inline-flex items-center text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg">
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
