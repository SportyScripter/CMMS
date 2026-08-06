import React from "react";
import { ShieldAlert, MessageSquare } from "lucide-react";

interface OrderExecutionViewProps {
  order: any;
  localOrderComments: string;
  setLocalOrderComments: (val: string) => void;
  localChecklist: any[];
  isExecutionAllowed: boolean;
  handleChecklistExecutionUpdate: (itemId: number, field: string, value: string) => void;
}

export const OrderExecutionView: React.FC<OrderExecutionViewProps> = ({
  order,
  localOrderComments,
  setLocalOrderComments,
  localChecklist,
  isExecutionAllowed,
  handleChecklistExecutionUpdate,
}) => {
  return (
    <div className="space-y-6">
      {/* Warning when user does not have permission to execute */}
      {!isExecutionAllowed && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center shadow-sm">
          <ShieldAlert className="w-6 h-6 mr-3 shrink-0 text-red-600" />
          <p className="text-sm">
            <strong>Brak uprawnień do realizacji.</strong> Zlecenie jest przypisane do innej roli (
            {order.performed?.role?.name || "innej"}).
          </p>
        </div>
      )}

      {/* General order information and summary comment */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
          Informacje ogólne
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Opis zlecenia
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200 min-h-[45px] shadow-inner">
              {order.description}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Komentarz ogólny (raport po przeglądzie)
            </label>
            <textarea
              value={localOrderComments}
              onChange={(e) => setLocalOrderComments(e.target.value)}
              disabled={!isExecutionAllowed}
              placeholder="Wpisz uwagi zbiorcze dotyczące całego zlecenia..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500 min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Checklist execution items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Karta Wykonawcza (Checklista)
          </h4>
          <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded text-gray-600">
            Kroków: {localChecklist.length}
          </span>
        </div>

        {localChecklist.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            Brak elementów checklisty.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {localChecklist.map((item, idx) => (
              <div
                key={item.id}
                className={`p-5 transition-colors ${
                  item.status === "NOK"
                    ? "bg-red-50/30"
                    : item.status === "OK"
                    ? "bg-emerald-50/30"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <span className="font-bold text-gray-400 mr-2">{idx + 1}.</span>
                    <span className="font-semibold text-gray-800 text-sm md:text-base">
                      {item.task_description}
                    </span>
                  </div>

                  {/* Execution Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={!isExecutionAllowed}
                      onClick={() => handleChecklistExecutionUpdate(item.id, "status", "OK")}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50 ${
                        item.status === "OK"
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-gray-500 border-gray-300 hover:border-emerald-500 hover:text-emerald-600"
                      }`}
                    >
                      OK
                    </button>
                    <button
                      disabled={!isExecutionAllowed}
                      onClick={() => handleChecklistExecutionUpdate(item.id, "status", "NOK")}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50 ${
                        item.status === "NOK"
                          ? "bg-red-500 text-white border-red-600 shadow-sm"
                          : "bg-white text-gray-500 border-gray-300 hover:border-red-500 hover:text-red-600"
                      }`}
                    >
                      NOK
                    </button>
                    <button
                      disabled={!isExecutionAllowed}
                      onClick={() => handleChecklistExecutionUpdate(item.id, "status", "ND")}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50 ${
                        item.status === "ND"
                          ? "bg-gray-600 text-white border-gray-700 shadow-sm"
                          : "bg-white text-gray-500 border-gray-300 hover:border-gray-500 hover:text-gray-700"
                      }`}
                      title="Nie dotyczy"
                    >
                      ND
                    </button>
                  </div>
                </div>

                {/* Item Specific Comment */}
                <div className="mt-3 pl-6">
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      disabled={!isExecutionAllowed}
                      value={item.comments || ""}
                      onChange={(e) =>
                        handleChecklistExecutionUpdate(item.id, "comments", e.target.value)
                      }
                      placeholder="Dodaj komentarz do tego punktu (opcjonalnie)..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};