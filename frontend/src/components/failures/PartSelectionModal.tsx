import React, { useState, useEffect, useMemo } from "react";
import { X, Search, PackageSearch, Plus, Loader2 } from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Part } from "../../types/part";

interface PartSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (part: Part) => void;
  parts: Part[];
  machineId: number;
}

export const PartSelectionModal: React.FC<PartSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  parts,
  machineId,
}) => {
  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterProducer, setFilterProducer] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterQr, setFilterQr] = useState("");
  const [isCompatibleOnly, setIsCompatibleOnly] = useState(false);
  
  const [compatiblePartIds, setCompatiblePartIds] = useState<number[]>([]);
  const [isLoadingCompat, setIsLoadingCompat] = useState(false);

  // Clear filters when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFilterName("");
      setFilterProducer("");
      setFilterType("");
      setFilterQr("");
      setIsCompatibleOnly(false);
    }
  }, [isOpen]);

  // Fetch compatible parts for the current machine if checkbox is checked
  useEffect(() => {
    if (isCompatibleOnly && isOpen) {
      const fetchCompatibleParts = async () => {
        setIsLoadingCompat(true);
        try {
          // UWAGA: Upewnij się, że masz ten endpoint na backendzie (zwracający powiązania dla danej maszyny)
          // Jeśli masz tylko /part-compatibilities, możesz pobrać wszystkie i przefiltrować po machine_id
          const response = await api.get(`/part-compatibilities/machine/${machineId}`);
          const ids = response.data.map((item: any) => item.part_id);
          setCompatiblePartIds(ids);
        } catch (error) {
          console.error("Nie udało się pobrać kompatybilnych części", error);
          setCompatiblePartIds([]); // Fallback to empty if error
        } finally {
          setIsLoadingCompat(false);
        }
      };
      fetchCompatibleParts();
    }
  }, [isCompatibleOnly, machineId, isOpen]);

  // Dynamic filtering logic
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchName = part.name.toLowerCase().includes(filterName.toLowerCase());
      const matchProducer = (part.producer || "").toLowerCase().includes(filterProducer.toLowerCase());
      const matchType = (part.type || "").toLowerCase().includes(filterType.toLowerCase());
      const matchQr = (part.qr_code || "").toLowerCase().includes(filterQr.toLowerCase());
      
      const matchCompat = isCompatibleOnly ? compatiblePartIds.includes(part.id) : true;

      return matchName && matchProducer && matchType && matchQr && matchCompat;
    });
  }, [parts, filterName, filterProducer, filterType, filterQr, isCompatibleOnly, compatiblePartIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
          <h3 className="font-bold text-emerald-900 flex items-center text-lg">
            <PackageSearch className="w-5 h-5 text-emerald-600 mr-2" />
            Wybierz część z magazynu
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nazwa części</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="np. Łożysko..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Producent</label>
            <input
              type="text"
              value={filterProducer}
              onChange={(e) => setFilterProducer(e.target.value)}
              placeholder="np. Festo..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Typ</label>
            <input
              type="text"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="np. Pneumatyka..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kod QR</label>
            <input
              type="text"
              value={filterQr}
              onChange={(e) => setFilterQr(e.target.value)}
              placeholder="np. QR123..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div className="md:col-span-4 flex items-center mt-1">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isCompatibleOnly}
                onChange={(e) => setIsCompatibleOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                Pokaż tylko części kompatybilne z obecną maszyną
              </span>
            </label>
            {isLoadingCompat && <Loader2 className="w-4 h-4 ml-3 animate-spin text-emerald-600" />}
          </div>
        </div>

        {/* Parts Table */}
        <div className="flex-1 overflow-y-auto bg-white p-4">
          {filteredParts.length === 0 ? (
            <div className="text-center py-12">
              <PackageSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">Brak wyników</p>
              <p className="text-gray-500">Zmień kryteria wyszukiwania, aby znaleźć część.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase font-semibold text-gray-500">
                  <th className="px-4 py-3">Producent</th>
                  <th className="px-4 py-3">Nazwa</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3 text-center">Stan Mag.</th>
                  <th className="px-4 py-3 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{part.producer || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{part.name}</td>
                    <td className="px-4 py-3 text-gray-600">{part.type}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${part.quantity > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {part.quantity} szt.
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelect(part)}
                        disabled={part.quantity <= 0}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md font-medium inline-flex items-center transition-colors text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Wybierz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};