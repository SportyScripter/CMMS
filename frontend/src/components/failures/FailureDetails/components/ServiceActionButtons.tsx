import React from "react";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { Failure } from "../../../../types/failure";

interface ServiceActionButtonsProps {
  failure: Failure;
  isActionLoading: boolean;
  handleStatusChange: (status: string) => void;
  setPendingStatus: (status: "WAITING_FOR_PARTS" | "WAITING_FOR_SERVICE") => void;
  setIsReasonModalOpen: (isOpen: boolean) => void;
  setIsResolving: (isResolving: boolean) => void;
}

export const ServiceActionButtons: React.FC<ServiceActionButtonsProps> = ({
  failure,
  isActionLoading,
  handleStatusChange,
  setPendingStatus,
  setIsReasonModalOpen,
  setIsResolving,
}) => {
  return (
    <div className="border-t border-gray-100 pt-6">
      <p className="text-sm font-medium text-gray-700 mb-3">
        Akcje dla serwisu:
      </p>
      <div className="flex flex-wrap gap-3">
        {/* Accept failure */}
        {["Pending", "CRITICAL", "WARNING"].includes(failure.status) && (
          <button
            onClick={() => handleStatusChange("ACCEPTED")}
            disabled={isActionLoading}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Przyjmij zgłoszenie
          </button>
        )}

        {/* Waiting for parts */}
        {["ACCEPTED", "IN_PROGRESS"].includes(failure.status) && (
          <button
            onClick={() => {
              setPendingStatus("WAITING_FOR_PARTS");
              setIsReasonModalOpen(true);
            }}
            disabled={isActionLoading}
            className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          >
            <Clock className="w-4 h-4 mr-2" /> Oczekiwanie na części
          </button>
        )}

        {/* Waiting for service */}
        {["ACCEPTED", "IN_PROGRESS"].includes(failure.status) && (
          <button
            onClick={() => {
              setPendingStatus("WAITING_FOR_SERVICE");
              setIsReasonModalOpen(true);
            }}
            disabled={isActionLoading}
            className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          >
            <Clock className="w-4 h-4 mr-2" /> Oczekiwanie na serwis zewnętrzny
          </button>
        )}

        {/* Start repair */}
        {failure.status !== "IN_PROGRESS" && (
          <button
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={isActionLoading}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-2" /> Rozpocznij naprawę
          </button>
        )}

        {/* Close repair */}
        <button
          onClick={() => setIsResolving(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors text-sm shadow-sm ml-auto"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> Zakończ naprawę
        </button>
      </div>
    </div>
  );
};