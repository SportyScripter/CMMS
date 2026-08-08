import React from "react";
import { Play, Save, CheckCircle, Loader2 } from "lucide-react";

interface OrderFooterProps {
  isEditMode: boolean;
  order: any;
  isExecutionAllowed: boolean;
  isSaving: boolean;
  allItemsProcessed: boolean;
  setIsEditMode: (val: boolean) => void;
  startOrder: () => void;
  saveExecutionProgress: (completeOrder: boolean) => void;
}

export const OrderFooter: React.FC<OrderFooterProps> = ({
  isEditMode,
  order,
  isExecutionAllowed,
  isSaving,
  allItemsProcessed,
  setIsEditMode,
  startOrder,
  saveExecutionProgress,
}) => {
  return (
    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
      {!isEditMode ? (
        <>
          <div className="text-sm text-gray-500 font-medium">
            {order.performed ? (
              <>
                Realizuje:{" "}
                <span className="text-blue-600 font-bold">
                  {order.performed.name} {order.performed.lastname}
                </span>
              </>
            ) : (
              <>
                Przypisany wydział:{" "}
                <span className="text-indigo-600 font-bold">
                  {order.assigned_role?.name || "Brak (ogólnodostępne)"}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {order.status === "scheduled" && isExecutionAllowed && (
              <button
                onClick={startOrder}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm"
              >
                <Play className="w-5 h-5 mr-2" /> Rozpocznij pracę
              </button>
            )}

            {order.status !== "scheduled" && isExecutionAllowed && (
              <>
                <button
                  onClick={() => saveExecutionProgress(false)}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Zapisz postępy
                </button>

                <button
                  onClick={() => saveExecutionProgress(true)}
                  disabled={isSaving || !allItemsProcessed}
                  title={
                    !allItemsProcessed
                      ? "Musisz określić status dla każdego punktu (OK/NOK/ND)"
                      : ""
                  }
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Zakończ zlecenie
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-end w-full gap-3">
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
          >
            Anuluj edycję
          </button>
          <button
            form="edit-order-form"
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors text-sm shadow-sm disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Zapisz strukturę zlecenia
          </button>
        </div>
      )}
    </div>
  );
};