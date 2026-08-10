import React, { useState } from "react";
import { Play, Save, CheckCircle, Loader2, PauseCircle, HandMetal, X } from "lucide-react";

interface OrderFooterProps {
  isEditMode: boolean;
  order: any;
  isExecutionAllowed: boolean;
  isSaving: boolean;
  allItemsProcessed: boolean;
  currentUserId: number; // 
  setIsEditMode: (val: boolean) => void;
  startOrder: () => void;
  saveExecutionProgress: (completeOrder: boolean, pauseReason?: string, isOperational?: boolean) => void; // <-- Zaktualizowana funkcja
}

export const OrderFooter: React.FC<OrderFooterProps> = ({
  isEditMode,
  order,
  isExecutionAllowed,
  isSaving,
  allItemsProcessed,
  currentUserId,
  setIsEditMode,
  startOrder,
  saveExecutionProgress,
}) => {
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [isOperational, setIsOperational] = useState(true);

  const handlePauseSubmit = () => {
    if (!pauseReason.trim()) return;
    saveExecutionProgress(false, pauseReason, isOperational);
    setIsPauseModalOpen(false);
    setPauseReason("");
  };

  const isTakeover = order.status === "in_progress" && order.performed_id !== currentUserId;

  return (
    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0 relative">
      {!isEditMode ? (
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          
          {/* BUTTON: Start / Resume */}
          {(order.status === "scheduled" || order.status === "paused") && isExecutionAllowed && (
            <button
              onClick={startOrder}
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm"
            >
              <Play className="w-5 h-5 mr-2" /> {order.status === "paused" ? "Wznów pracę" : "Rozpocznij pracę"}
            </button>
          )}

          {/* BUTTON: Take over the order */}
          {isTakeover && isExecutionAllowed && (
            <button
              onClick={startOrder}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm"
            >
              <HandMetal className="w-5 h-5 mr-2" /> Przejmij zlecenie
            </button>
          )}

          {/* Action Buttons (When someone is executing) */}
          {order.status === "in_progress" && !isTakeover && isExecutionAllowed && (
            <>
              {/* Hold Button */}
              <button
                onClick={() => setIsPauseModalOpen(true)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50"
              >
                <PauseCircle className="w-5 h-5 mr-2" /> Wstrzymaj
              </button>

              <button
                onClick={() => saveExecutionProgress(false)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Zapisz postępy
              </button>

              <button
                onClick={() => saveExecutionProgress(true)}
                disabled={isSaving || !allItemsProcessed}
                title={!allItemsProcessed ? "Musisz określić status dla każdego punktu" : ""}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Zakończ zlecenie
              </button>
            </>
          )}
        </div>
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
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Zapisz strukturę zlecenia
          </button>
        </div>
      )}

      {/* Pause Modal */}
      {isPauseModalOpen && (
        <div className="absolute bottom-full right-6 mb-4 w-80 bg-white p-5 rounded-xl shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-800">Wstrzymanie zlecenia</h4>
            <button onClick={() => setIsPauseModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Powód wstrzymania *</label>
          <textarea 
            value={pauseReason}
            onChange={(e) => setPauseReason(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-slate-500 mb-3"
            placeholder="Napisz dlaczego przerywasz pracę..."
            rows={2}
          />

          <label className="flex items-start gap-2 cursor-pointer mb-4">
            <input 
              type="checkbox" 
              checked={isOperational}
              onChange={(e) => setIsOperational(e.target.checked)}
              className="mt-1 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Maszyna jest złożona i <strong>gotowa do produkcji</strong> (nadaje jej to status Sprawna).
            </span>
          </label>

          <button 
            onClick={handlePauseSubmit}
            disabled={!pauseReason.trim()}
            className="w-full py-2 bg-slate-600 text-white rounded-lg font-bold text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Zatwierdź i wstrzymaj
          </button>
        </div>
      )}
    </div>
  );
};