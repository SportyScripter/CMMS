import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axiosConfig";
import { Part, PartCategory } from "../types/part";
import { PartEditModal } from "../components/PartEditModal";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  PackageSearch,
  Loader2,
  AlertCircle,
  Plus,
  Filter,
  X,
  AlertTriangle,
  Link as LinkIcon,
  Info,
  Wrench,
  Edit,
} from "lucide-react";

export const PartListPage = () => {
  const { user } = useAuth();
  const canManageParts =
    user?.role.name === "Super Admin" ||
    user?.role.name === "Kierownik" ||
    user?.role.name === "Technik" ||
    user?.role.name === "Admin";

  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [compatibleMachines, setCompatibleMachines] = useState<any[]>([]);
  const [isCompatModalOpen, setIsCompatModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingCompat, setIsLoadingCompat] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterQr, setFilterQr] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterProducer, setFilterProducer] = useState("");

  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const partResponse = await api.get<Part[]>("/parts");
        const categoryResponse =
          await api.get<PartCategory[]>("/part-categories");
        setParts(partResponse.data);
        setCategories(categoryResponse.data);
      } catch (err: any) {
        setError(
          "Nie udało się pobrać danych z serwera. Sprawdź połączenie z bazą danych.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarehouseData();
  }, []);

  const fetchCompatibilities = async (partId: number) => {
    setIsLoadingCompat(true);
    try {
      const response = await api.get(`/part-compatibilities/part/${partId}`);
      setCompatibleMachines(response.data);
    } catch (err) {
      console.error("Nie udało się pobrać kompatybilnych maszyn", err);
    } finally {
      setIsLoadingCompat(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Brak kategorii";
  };
  const availablePartsForType = filterCategory
    ? parts.filter((p) => p.category_id.toString() === filterCategory)
    : parts;

  const uniqueTypes = Array.from(
    new Set(availablePartsForType.map((p) => p.type)),
  );
  const filteredParts = parts.filter((part) => {
    const matchProducer = (part.producer || "")
      .toLowerCase()
      .includes(filterProducer.toLowerCase());
    const matchName = part.name
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const matchQr = part.qr_code.toLowerCase().includes(filterQr.toLowerCase());
    const matchCategory = filterCategory
      ? part.category_id === Number(filterCategory)
      : true;
    const matchType = filterType ? part.type === filterType : true;
    return matchName && matchQr && matchCategory && matchType && matchProducer;
  });
  const clearFilters = () => {
    setFilterName("");
    setFilterQr("");
    setFilterCategory("");
    setFilterType("");
    setFilterProducer("");
  };

  return (
    <div className="max-w-auto mx-auto space-y-1 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PackageSearch className="w-8 h-8 text-blue-600 mr-3" />
              Magazyn części
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Przeglądaj stany magazynowe. Kliknij "Szczegóły", aby zobaczyć
              pełne dane.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !error && parts.length > 0 && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center px-4 py-2 rounded-lg gont-medium transition-colors ${
                isFilterOpen
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtruj
            </button>
          )}
          {canManageParts && (
            <Link
              to="/parts/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Dodaj część
            </Link>
          )}
        </div>
      </div>
      {isFilterOpen && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Filtruj części
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Wyczyść filtry
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p>Ładowanie danych magazynowych...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            {error}
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <PackageSearch className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">Brak części</p>
            <p className="mt-1">
              Nie znaleziono części spełniających kryteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Producent</th>
                  <th className="px-6 py-4">Nazwa</th>
                  <th className="px-6 py-4">Typ</th>
                  <th className="px-6 py-4">Kategoria</th>
                  <th className="px-6 py-4">Ilość</th>
                  <th className="px-6 py-4">Lokalizacja</th>
                  <th className="px-6 py-4 text-center">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredParts.map((part, index) => {
                  const isLowStock = part.quantity <= part.min_quantity;

                  return (
                    <tr
                      key={part.id}
                      className={`transition-colors ${isLowStock ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-blue-50/50"}`}
                    >
                      <td className="px-6 py-4 text-center font-medium text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {part.producer || (
                          <span className="italic text-gray-300">Brak</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {part.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{part.type}</td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {getCategoryName(part.category_id)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`text-lg font-bold ${isLowStock ? "text-red-600" : "text-emerald-600"}`}
                          >
                            {part.quantity}
                          </span>
                          {isLowStock && (
                            <span title="Stan krytyczny!">
                              <AlertTriangle
                                className="w-4 h-4 text-red-500 ml-2"
                                aria-label="Stan krytyczny!"
                              />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {part.location}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Info className="w-3.5 h-3.5 mr-1.5" />
                            Szczegóły
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Szczegóły części
                </h2>
                {canManageParts && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Przejdź do edycji
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedPart(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Producent</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPart.producer}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nazwa</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPart.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kategoria</p>
                  <p className="font-semibold text-gray-900">
                    {getCategoryName(selectedPart.category_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Typ (Klasyfikacja)
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedPart.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kod QR</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPart.qr_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Stan magazynowy / Minimum
                  </p>
                  <p className="font-medium">
                    <span
                      className={
                        selectedPart.quantity <= selectedPart.min_quantity
                          ? "text-red-600 font-bold"
                          : "text-emerald-600 font-bold"
                      }
                    >
                      {selectedPart.quantity} szt.
                    </span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-gray-600">
                      {selectedPart.min_quantity} szt.
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cena jednostkowa</p>
                  <p className="font-medium text-gray-900">
                    {selectedPart.price.toFixed(2)} zł
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Systemowe</p>
                  <p className="font-medium text-gray-500">
                    #{selectedPart.id}
                  </p>
                </div>
              </div>
              {(selectedPart.url_address ||
                selectedPart.docs ||
                selectedPart.id) && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                  {selectedPart.url_address && (
                    <a
                      href={selectedPart.url_address}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Link do dostawcy
                    </a>
                  )}
                  {selectedPart.docs && (
                    <a
                      href={selectedPart.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <PackageSearch className="w-4 h-4 mr-2" />
                      Dokumentacja techniczna
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompatModalOpen(true);
                      fetchCompatibilities(selectedPart.id);
                    }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium flex items-center transition-colors ml-auto"
                  >
                    <Wrench className="w-4 h-4 mr-2" /> Pasuje do urządzeń
                  </button>
                </div>
              )}
            </div>
            {isEditModalOpen && selectedPart && (
              <PartEditModal
                part={selectedPart}
                categories={categories}
                setCategories={setCategories} 
                onClose={() => setIsEditModalOpen(false)}
                onUpdated={async () => {
                  setIsLoading(true);
                  try {
                    const response = await api.get<Part[]>("/parts");
                    setParts(response.data);
                    const updatedCurrent = response.data.find(
                      (p) => p.id === selectedPart.id,
                    );
                    if (updatedCurrent) setSelectedPart(updatedCurrent);
                  } catch (err) {
                    console.error("Nie udało się odświeżyć listy części", err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              />
            )}

            {isCompatModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
                    <h3 className="font-semibold text-gray-900 flex items-center text-base">
                      <Wrench className="w-5 h-5 text-emerald-600 mr-2" />
                      Kompatybilne urządzenia dla: {selectedPart.name}
                    </h3>
                    <button
                      onClick={() => setIsCompatModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto space-y-2 flex-1">
                    {isLoadingCompat ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                      </div>
                    ) : compatibleMachines.length === 0 ? (
                      <p className="text-center text-gray-500 py-8 text-sm">
                        Ta część nie została przypisana do żadnego urządzenia.
                      </p>
                    ) : (
                      compatibleMachines.map((item) => (
                        <div
                          key={`${item.part_id}-${item.machine_id}`}
                          className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex flex-col"
                        >
                          <span className="font-medium text-gray-900 text-sm">
                            {item.machine.name}
                          </span>
                          {item.machine.location && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              Lokalizacja: {item.machine.location}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCompatModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
