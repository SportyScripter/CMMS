import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Activity,
  Loader2,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Clock,
  User,
  Wrench,
  Settings,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Failure } from "../../types/failure";
import { MachineFailuresModalProps } from "../../types/machine";
import {
  getStatusBadgeStyle,
  translateStatus,
} from "../../utils/statusUtils";
import { calculateDowntime, formatDateTime } from "../../utils/dateUtils";

export const MachineFailuresModal: React.FC<MachineFailuresModalProps> = ({
  isOpen,
  onClose,
  machineId,
  machineName,
}) => {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFailure, setSelectedFailure] = useState<Failure | null>(null);

  useEffect(() => {
    if (isOpen && machineId) {
      const fetchFailures = async () => {
        setIsLoading(true);
        setError("");
        try {
          const response = await api.get<Failure[]>(
            `/failures/machine/${machineId}`,
          );
          setFailures(response.data);
        } catch (err: any) {
          setError("Nie udało się pobrać listy awarii.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchFailures();
    } else {
      setFailures([]);
      setSelectedFailure(null);
    }
  }, [isOpen, machineId]);

  // Sort failures by updated_at or created_at in descending order
  const sortedFailures = useMemo(() => {
    return [...failures].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  }, [failures]);

  const handleClose = () => {
    setSelectedFailure(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center">
            {selectedFailure ? (
              <button
                onClick={() => setSelectedFailure(null)}
                className="mr-4 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <Activity className="w-6 h-6 mr-3 text-red-500" />
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedFailure ? "Szczegóły awarii" : "Historia awarii"}
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
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
              <p>Pobieranie danych...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-6 text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : selectedFailure ? (
            // --- DETAIL VIEW ---
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  {/* Dynamic Badge applied here */}
                  <span
                    className={`px-3 py-1 font-bold text-sm rounded-lg border uppercase ${getStatusBadgeStyle(selectedFailure.status)}`}
                  >
                    {translateStatus(selectedFailure.status)}
                  </span>
                  <span className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Czas postoju:{" "}
                    <span className="text-gray-900 ml-1">
                      {calculateDowntime(
                        selectedFailure.created_at,
                        selectedFailure.end_date,
                      )}
                    </span>
                  </span>
                </div>

                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                  Opis zgłoszenia
                </h4>
                <p className="text-gray-900 text-base">
                  {selectedFailure.failure_description || "Brak opisu."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Zgłaszający
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {selectedFailure.submitter?.name}{" "}
                      {selectedFailure.submitter?.lastname || "Nie podano"}
                    </p>
                    {selectedFailure.submitter?.role?.name && (
                      <p className="text-xs text-gray-400">
                        Stanowisko: {selectedFailure.submitter?.role.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatDateTime(selectedFailure.created_at)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Serwisant
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {selectedFailure.recipient?.name}{" "}
                      {selectedFailure.recipient?.lastname || "Nie przypisano"}
                    </p>
                    {selectedFailure.recipient?.role?.name && (
                      <p className="text-xs text-gray-400">
                        Stanowisko: {selectedFailure.recipient?.role.name}
                      </p>
                    )}
                    {selectedFailure.end_date && (
                      <p className="text-xs text-gray-400">
                        Zakończono:{" "}
                        {formatDateTime(selectedFailure.end_date)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Parts section */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-gray-900 font-bold mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-400" />
                  Wymienione części
                </h4>
                <p className="text-sm text-gray-500 italic">
                  Brak zarejestrowanych części dla tej naprawy.
                </p>
              </div>
            </div>
          ) : sortedFailures.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Brak zarejestrowanych awarii dla tej maszyny.
              </p>
            </div>
          ) : (
            // --- LIST VIEW ---
            <div className="space-y-3">
              {/* Using the sorted array! */}
              {sortedFailures.map((failure) => (
                <div
                  key={failure.id}
                  onClick={() => setSelectedFailure(failure)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-md border uppercase ${getStatusBadgeStyle(failure.status)}`}
                      >
                        {translateStatus(failure.status)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {/* Using formatDateTime for the main list */}
                        {formatDateTime(failure.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {failure.failure_description || "Brak opisu"}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-red-500 rotate-180 transition-colors" />
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