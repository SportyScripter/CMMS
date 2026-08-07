import React from "react";
import { X } from "lucide-react";
import { PartCategory } from "../../types/part";

interface PartFiltersProps {
  isOpen: boolean;
  activeTab: "warehouse" | "history";
  categories: PartCategory[];
  uniqueTypes: string[];
  filterProducer: string;
  setFilterProducer: (val: string) => void;
  filterName: string;
  setFilterName: (val: string) => void;
  filterQr: string;
  setFilterQr: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  
  filterTransactionType?: string;
  setFilterTransactionType?: (val: string) => void;

  onClear: () => void;
}

export const PartFilters: React.FC<PartFiltersProps> = ({
  isOpen,
  activeTab,
  categories,
  uniqueTypes,
  filterProducer,
  setFilterProducer,
  filterName,
  setFilterName,
  filterQr,
  setFilterQr,
  filterCategory,
  setFilterCategory,
  filterType,
  setFilterType,
  filterTransactionType = "",
  setFilterTransactionType,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          {activeTab === "warehouse" ? "Filtruj części" : "Filtruj historię części"}
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-red-600 flex items-center cursor-pointer"
        >
          <X className="w-4 h-4 mr-1" />
          Wyczyść filtry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Producent */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Producent / Dostawca
          </label>
          <input
            type="text"
            value={filterProducer}
            onChange={(e) => setFilterProducer(e.target.value)}
            placeholder="np. Balluff"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Nazwa części */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Nazwa części
          </label>
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="np. Łożysko..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Kod QR */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Kod QR
          </label>
          <input
            type="text"
            value={filterQr}
            onChange={(e) => setFilterQr(e.target.value)}
            placeholder="np. 123456..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Kategoria */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Kategoria
          </label>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setFilterType("");
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Typ (zawsze widoczny dla magazynu) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Typ
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Wszystkie typy</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* DODATKOWE POLE: Typ operacji - pojawia się w siatce filtrów TYLKO w zakładce historii */}
        {activeTab === "history" && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Typ operacji
            </label>
            <select
              value={filterTransactionType}
              onChange={(e) => setFilterTransactionType && setFilterTransactionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Wszystkie typy operacji</option>
              <option value="FAILURE">Zużycie (Awaria)</option>
              <option value="DELIVERY">Dostawa</option>
              <option value="MANUAL_DISPATCH">Pobranie ręczne</option>
              <option value="RETURN">Zwrot</option>
              <option value="ADJUSTMENT">Korekta stanu</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};