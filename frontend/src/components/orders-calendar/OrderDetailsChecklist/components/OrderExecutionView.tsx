import React from "react";
import { ShieldAlert, MessageSquare, PlayCircle, Clock, CheckCircle2, User, Info } from "lucide-react";
import { formatDateTime, } from "../../../../utils/dateUtils";

interface OrderExecutionViewProps {
  order: any;
  localExecutionReport: string; 
  setLocalExecutionReport: (val: string) => void; 
  localChecklist: any[];
  isExecutionAllowed: boolean;
  handleChecklistExecutionUpdate: (itemId: number, field: string, value: string) => void;
}

export const OrderExecutionView: React.FC<OrderExecutionViewProps> = ({
  order,
  localExecutionReport,
  setLocalExecutionReport,
  localChecklist,
  isExecutionAllowed,
  handleChecklistExecutionUpdate,
}) => {
  return (
    <div className="space-y-6">
      {!isExecutionAllowed && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center shadow-sm">
          <ShieldAlert className="w-6 h-6 mr-3 shrink-0 text-red-600" />
          <p className="text-sm">
            <strong>Brak uprawnień do realizacji.</strong> Zlecenie jest przypisane do wydziału: 
            <span className="font-bold ml-1">{order.assigned_role?.name || "innego"}</span>, 
            lub jest już realizowane przez inną osobę.
          </p>
        </div>
      )}

      {/* Panel with execution information */}
      {(order.started_at || order.work_time_minutes > 0) && (
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-sm flex flex-col md:flex-row flex-wrap gap-4 md:gap-8 items-start md:items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-indigo-900/60 font-bold block text-xs uppercase tracking-wider">Realizuje</span>
              <span className="font-bold text-indigo-900 text-sm">
                {order.performed?.name} {order.performed?.lastname}
              </span>
            </div>
          </div>
          
          {order.started_at && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-blue-900/60 font-bold block text-xs uppercase tracking-wider">Rozpoczęto</span>
                <span className="font-bold text-blue-900 text-sm">{formatDateTime(order.started_at)}</span>
              </div>
            </div>
          )}

          {order.completed_at && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-emerald-900/60 font-bold block text-xs uppercase tracking-wider">Zakończono</span>
                <span className="font-bold text-emerald-900 text-sm">{formatDateTime(order.completed_at)}</span>
              </div>
            </div>
          )}

          {/* Work Time */}
          <div className="flex items-center gap-3 md:ml-auto">
            <div className="p-2 bg-gray-200 rounded-lg text-gray-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-500 font-bold block text-xs uppercase tracking-wider">Czas pracy</span>
              <span className="font-bold text-gray-800 text-sm">
                {order.work_time_minutes ? `${Math.floor(order.work_time_minutes / 60)}h ${order.work_time_minutes % 60}m` : "W toku"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* If order is paused show reason */}
      {order.status === "paused" && order.pause_reason && (
        <div className="p-4 bg-slate-100 text-slate-800 rounded-xl border border-slate-300 flex items-center shadow-sm">
          <Info className="w-6 h-6 mr-3 shrink-0 text-slate-600" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Powód wstrzymania</p>
            <p className="font-medium">{order.pause_reason}</p>
          </div>
        </div>
      )}

      {/* Main information */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
          Informacje ogólne i Raport
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Krótki opis zadania</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200 min-h-[45px] shadow-inner">
              {order.description}
            </div>
          </div>
          {order.comments && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Wskazówki dla wykonawcy (Planista)</label>
              <div className="px-4 py-3 bg-amber-50/50 rounded-lg text-sm text-amber-900 border border-amber-200 min-h-[45px]">
                {order.comments}
              </div>
            </div>
          )}

          {/* Execution Report */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Raport z wykonania (Wypełnia technik)
            </label>
            <textarea
              value={localExecutionReport}
              onChange={(e) => setLocalExecutionReport(e.target.value)}
              disabled={!isExecutionAllowed}
              placeholder="Wpisz uwagi zbiorcze, co zostało zrobione..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500 min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
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
                    <span className="font-bold text-gray-400 mr-2">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-gray-800 text-sm md:text-base">
                      {item.task_description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={!isExecutionAllowed}
                      onClick={() =>
                        handleChecklistExecutionUpdate(item.id, "status", "OK")
                      }
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
                      onClick={() =>
                        handleChecklistExecutionUpdate(item.id, "status", "NOK")
                      }
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
                      onClick={() =>
                        handleChecklistExecutionUpdate(item.id, "status", "ND")
                      }
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all disabled:opacity-50 ${
                        item.status === "ND"
                          ? "bg-gray-600 text-white border-gray-700 shadow-sm"
                          : "bg-white text-gray-500 border-gray-300 hover:border-gray-500 hover:text-gray-700"
                      }`}
                    >
                      ND
                    </button>
                  </div>
                </div>
                <div className="mt-3 pl-6">
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      disabled={!isExecutionAllowed}
                      value={item.comments || ""}
                      onChange={(e) =>
                        handleChecklistExecutionUpdate(
                          item.id,
                          "comments",
                          e.target.value,
                        )
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
