import React, { useEffect, useState } from "react";
import { api } from "../../api/axiosConfig";
import { Loader2, AlertCircle, History, ExternalLink } from "lucide-react";
import { Part, PartCategory } from "../../types/part";
import { OperationDetailsModal } from "./modals/OperationDetailsModal";

const transactionTypeTranslations: Record<
  string,
  { label: string; color: string }
> = {
  FAILURE: {
    label: "Zużycie (Awaria)",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  DELIVERY: {
    label: "Dostawa",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  MANUAL_DISPATCH: {
    label: "Pobranie ręczne",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  RETURN: {
    label: "Zwrot",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ADJUSTMENT: {
    label: "Korekta stanu",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

interface GlobalHistoryItem {
  id: number;
  part_id: number;
  user_id: number;
  machine_id: number | null;
  failure_id: number | null;
  quantity_change: number;
  transaction_type: string;
  reason: string;
  created_at: string;
}

interface PartHistoryGlobalViewProps {
  parts: Part[];
  categories: PartCategory[];
  filterProducer: string;
  filterName: string;
  filterQr: string;
  filterCategory: string;
  filterTransactionType: string;
  onSelectFailure?: (failureId: number) => void;
}

export const PartHistoryGlobalView: React.FC<PartHistoryGlobalViewProps> = ({
  parts,
  categories,
  filterProducer,
  filterName,
  filterQr,
  filterCategory,
  filterTransactionType,
  onSelectFailure,
}) => {
  const [history, setHistory] = useState<GlobalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOp, setSelectedOp] = useState<any | null>(null);
  useEffect(() => {
    const fetchGlobalHistory = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<GlobalHistoryItem[]>("/part-history/");
        setHistory(response.data);
      } catch (err) {
        setError(
          "Nie udało się pobrać globalnej historii operacji magazynowych.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalHistory();
  }, []);

  const getPartDetails = (partId: number) => {
    return parts.find((p) => p.id === partId);
  };

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Brak kategorii";
  };

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const filteredHistory = sortedHistory.filter((item) => {
    const part = getPartDetails(item.part_id);

    const producer = part?.producer || "";
    const name = part?.name || "";
    const qr = part?.qr_code || "";
    const categoryId = part?.category_id;

    const matchProducer = producer
      .toLowerCase()
      .includes(filterProducer.toLowerCase());
    const matchName = name.toLowerCase().includes(filterName.toLowerCase());
    const matchQr = qr.toLowerCase().includes(filterQr.toLowerCase());
    const matchCategory = filterCategory
      ? categoryId === parseInt(filterCategory)
      : true;
    const matchTransactionType = filterTransactionType
      ? item.transaction_type === filterTransactionType
      : true;

    return (
      matchProducer &&
      matchName &&
      matchQr &&
      matchCategory &&
      matchTransactionType
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p>Ładowanie rejestru operacji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12 text-red-600 bg-white rounded-xl shadow-sm border border-gray-100">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center">
          <History className="w-4 h-4 mr-2 text-blue-600" />
          Rejestr Operacji Magazynowych
        </h3>
        <span className="text-xs text-gray-500">
          Znaleziono wpisów: {filteredHistory.length}
        </span>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <History className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">Brak wyników</p>
          <p className="mt-1 text-sm">
            Nie znaleziono operacji spełniających kryteria filtrowania.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-600 font-semibold text-xs">
                <th className="px-6 py-3">Data i czas</th>
                <th className="px-6 py-3">Część</th>
                <th className="px-6 py-3">Kategoria</th>
                <th className="px-6 py-3">Typ operacji</th>
                <th className="px-6 py-3 text-center">Zmiana</th>
                <th className="px-6 py-3">Powód / Opis</th>
                <th className="px-6 py-3 text-center">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((item) => {
                const part = getPartDetails(item.part_id);
                const badge = transactionTypeTranslations[
                  item.transaction_type
                ] || {
                  label: item.transaction_type,
                  color: "bg-gray-50 text-gray-700 border-gray-200",
                };
                const isPositive = item.quantity_change > 0;
                const hasFailure = Boolean(item.failure_id);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs font-medium">
                      {new Date(item.created_at).toLocaleString("pl-PL")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {part ? part.name : `Część #${item.part_id}`}
                      </div>
                      {part && (
                        <div className="text-xs text-gray-500">
                          {part.producer ? `${part.producer} | ` : ""} QR:{" "}
                          {part.qr_code}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {part ? getCategoryName(part.category_id) : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold whitespace-nowrap">
                      <span
                        className={
                          isPositive ? "text-emerald-600" : "text-red-600"
                        }
                      >
                        {isPositive
                          ? `+${item.quantity_change}`
                          : item.quantity_change}{" "}
                        szt.
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-gray-700 max-w-md truncate"
                      title={item.reason}
                    >
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {hasFailure && onSelectFailure ? (
                        <button
                          onClick={() => onSelectFailure(item.failure_id!)}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Przejdź do powiązanej awarii"
                        >
                          Awaria #{item.failure_id}
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedOp(item)}
                          className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Szczegóły
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <OperationDetailsModal
        isOpen={!!selectedOp}
        onClose={() => setSelectedOp(null)}
        operation={selectedOp}
        parts={parts}
      />
    </div>
  );
};
