import React from "react";
import { X, Edit2 } from "lucide-react";
import {
  getCalendarBadgeStyle,
  translateCalendarStatus,
  getPriorityBadgeStyle,
  translatePriority,
} from "../../../../utils/statusUtils";

interface OrderHeaderProps {
  order: any;
  canEditGlobalDetails: boolean;
  isEditMode: boolean;
  handleEnableEditMode: () => void;
  onClose: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  order,
  canEditGlobalDetails,
  isEditMode,
  handleEnableEditMode,
  onClose,
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
      <div>
        <h3 className="font-bold text-gray-900 text-lg flex items-center flex-wrap gap-2">
          Zlecenie #{order.id}
          <span
            className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider border ${getCalendarBadgeStyle(
              order.status,
              order.scheduled_date,
            )}`}
          >
            {translateCalendarStatus(order.status)}
          </span>
          {order.priority && (
            <span
              className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider border ${getPriorityBadgeStyle(
                order.priority,
              )}`}
            >
              {translatePriority(order.priority)}
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Maszyna:{" "}
          <span className="font-semibold text-gray-700">
            {order.order_machine?.name || "Brak"}
          </span>{" "}
          | Typ:{" "}
          <span className="font-semibold text-gray-700">
            {order.order_type?.name}
          </span>
          {order.assigned_role && (
            <>
              {" "}
              | Wydział:{" "}
              <span className="font-semibold text-indigo-700">
                {order.assigned_role.name}
              </span>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Zlecił:{" "}
          <span className="font-semibold text-gray-700">
            {order.principal
              ? `${order.principal.name} ${order.principal.lastname}`
              : "Brak danych"}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {canEditGlobalDetails && !isEditMode && (
          <button
            onClick={handleEnableEditMode}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edytuj zlecenie
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg bg-white border border-gray-200 shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
