import React, { useEffect, useState } from "react";
import { api } from "../../api/axiosConfig";
import { Loader2, AlertCircle, History } from "lucide-react";
import { TRANSACTION_TYPES } from "../../utils/constants";

interface PartHistoryItem {
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

interface PartHistoryTabProps {
  partId: number;
}

export const PartHistoryTab: React.FC<PartHistoryTabProps> = ({ partId }) => {
  const [history, setHistory] = useState<PartHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<PartHistoryItem[]>(
          `/part-history/part/${partId}`,
        );
        setHistory(response.data);
      } catch (err) {
        setError("Nie udało się pobrać historii operacji dla tej części.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [partId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600 text-sm">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <History className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        Brak zarejestrowanych operacji dla tej części.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Typ operacji</th>
              <th className="px-4 py-3 text-center">Zmiana ilości</th>
              <th className="px-4 py-3">Powód / Opis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((item) => {
              const badge = TRANSACTION_TYPES[item.transaction_type] || {
                label: item.transaction_type,
                color: "bg-gray-50 text-gray-700 border-gray-200",
              };
              const isPositive = item.quantity_change > 0;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-medium border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold whitespace-nowrap">
                    <span
                      className={
                        isPositive ? "text-emerald-600" : "text-red-600"
                      }
                    >
                      {isPositive
                        ? `+${item.quantity_change}`
                        : item.quantity_change}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-gray-700 max-w-xs truncate"
                    title={item.reason}
                  >
                    {item.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
