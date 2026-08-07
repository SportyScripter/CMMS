import React, { useState, useEffect } from "react";
import { api } from "../../../api/axiosConfig";
import { Part } from "../../../types/part";
import { X, SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";

interface TakePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: Part | null;
  onSuccess: () => void;
}

export const TakePartModal: React.FC<TakePartModalProps> = ({
  isOpen,
  onClose,
  part,
  onSuccess,
}) => {
  const [transactionType, setTransactionType] =
    useState<string>("MANUAL_DISPATCH");
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [compatibleMachines, setCompatibleMachines] = useState<any[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && part) {
      setTransactionType("MANUAL_DISPATCH");
      setQuantityChange(1);
      setReason("");
      setSelectedMachineId("");
      setError("");

      const fetchCompatibilities = async () => {
        setIsLoadingMachines(true);
        try {
          const res = await api.get(`/part-compatibilities/part/${part.id}`);
          setCompatibleMachines(res.data);
        } catch (err) {
          console.error("Nie udało się pobrać kompatybilnych maszyn", err);
        } finally {
          setIsLoadingMachines(false);
        }
      };
      fetchCompatibilities();
    }
  }, [isOpen, part]);

  if (!isOpen || !part) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantityChange === 0) {
      setError("Wartość zmiany ilości nie może wynosić 0.");
      return;
    }

    const isDecrement = ["FAILURE", "MANUAL_DISPATCH"].includes(
      transactionType,
    );
    if (isDecrement && quantityChange > part.quantity) {
      setError(
        `Brak wystarczającej ilości w magazynie (dostępne: ${part.quantity} szt.).`,
      );
      return;
    }

    const isReasonRequired = ["FAILURE", "MANUAL_DISPATCH"].includes(
      transactionType,
    );
    if (isReasonRequired && !reason.trim()) {
      setError("Podaj powód / opis operacji magazynowej.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    let finalQuantityChange = Number(quantityChange);
    if (isDecrement && finalQuantityChange > 0) {
      finalQuantityChange = -finalQuantityChange;
    }
    const defaultReasons: Record<string, string> = {
      DELIVERY: "Dostawa części",
      RETURN: "Zwrot z serwisu",
      ADJUSTMENT: "Korekta inwentarzowa",
      MANUAL_DISPATCH: "Ręczne pobranie",
      FAILURE: "Zużycie (Awaria)",
    };

    try {
      await api.post(`/part-history/part/${part.id}`, {
        quantity_change: finalQuantityChange,
        transaction_type: transactionType,
        reason:
          reason.trim() ||
          defaultReasons[transactionType] ||
          "Operacja magazynowa",
        machine_id: selectedMachineId ? Number(selectedMachineId) : null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Wystąpił błąd podczas rejestrowania operacji.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/50">
          <h3 className="font-semibold text-gray-900 flex items-center text-base">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600 mr-2" />
            Edytuj stan: {part.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Aktualny stan magazynowy
            </label>
            <p className="text-sm font-semibold text-gray-900">
              {part.quantity} szt. ({part.location || "Brak lokalizacji"})
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Typ operacji magazynowej *
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="MANUAL_DISPATCH">Pobranie ręczne (rozchód)</option>
              <option value="DELIVERY">Dostawa (przychód)</option>
              <option value="RETURN">Zwrot z serwisu (przychód)</option>
              <option value="ADJUSTMENT">Korekta inwentarzowa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Ilość sztuk *
            </label>
            <input
              type="number"
              min="1"
              value={quantityChange}
              onChange={(e) =>
                setQuantityChange(Math.abs(Number(e.target.value)))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {["DELIVERY", "RETURN"].includes(transactionType)
                ? "Ta ilość zostanie dodana do stanu magazynowego."
                : transactionType === "ADJUSTMENT"
                  ? "Wprowadź wartość korekty."
                  : "Ta ilość zostanie odjęta ze stanu magazynowego."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Powiązana maszyna (opcjonalnie)
            </label>
            {isLoadingMachines ? (
              <div className="flex items-center text-xs text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-emerald-600" />{" "}
                Ładowanie maszyn...
              </div>
            ) : (
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- Wybierz maszynę (opcjonalnie) --</option>
                {compatibleMachines.map((item) => (
                  <option key={item.machine_id} value={item.machine_id}>
                    {item.machine.name}{" "}
                    {item.machine.location ? `(${item.machine.location})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Powód / Opis operacji
              {["FAILURE", "MANUAL_DISPATCH"].includes(transactionType) && " *"}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                ["FAILURE", "MANUAL_DISPATCH"].includes(transactionType)
                  ? "np. Wymiana czujnika..."
                  : "Opcjonalny opis..."
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Zapisz zmianę stanu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
