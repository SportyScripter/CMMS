import { useEffect, useState } from "react";
import { api } from "../api/axiosConfig";
import { Part, PartCategory } from "../types/part";
import { PartEditModal } from "../components/parts/modals/PartEditModal";
import { CreatePartModal } from "../components/parts/modals/CreatePartModal";
import { PartDetailsModal } from "../components/parts/modals/PartDetailsModal";
import { PartFilters } from "../components/parts/PartFilters";
import { PartCompatibilityModal } from "../components/parts/modals/PartCompatibilityModal";
import { PartHistoryGlobalView } from "../components/parts/PartHistoryGlobalView";
import { useAuth } from "../context/AuthContext";
import { FailureDetailsModal } from "../components/failures/FailureDetails";
import { TakePartModal } from "../components/parts/modals/TakePartModal";
import {
  PackageSearch,
  Loader2,
  AlertCircle,
  Plus,
  Filter,
  AlertTriangle,
  Info,
  History,
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingCompat, setIsLoadingCompat] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"warehouse" | "history">(
    "warehouse",
  );

  const [filterName, setFilterName] = useState("");
  const [filterQr, setFilterQr] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterProducer, setFilterProducer] = useState("");

  const [filterTransactionType, setFilterTransactionType] = useState("");

  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [selectedFailureId, setSelectedFailureId] = useState<number | null>(
    null,
  );

  const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);

  const fetchWarehouseData = async () => {
    setIsLoading(true);
    setError("");
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

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchCompatibilities = async (partId: number) => {
    setIsLoadingCompat(true);
    try {
      const response = await api.get(`/part-compatibilities/part/${partId}`);
      setCompatibleMachines(response.data);
    } catch (err) {
      console.error("Failed to fetch compatible machines", err);
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
    setFilterTransactionType("");
  };

  return (
    <div className="max-w-auto mx-auto space-y-4 p-2">
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          {!isLoading && !error && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
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
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Dodaj część
            </button>
          )}
        </div>
      </div>

      {/* --- Switch view --- */}
      <div className="flex justify-end">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab("warehouse")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "warehouse"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <PackageSearch className="w-4 h-4 mr-2" />
            Magazyn
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            Historia części
          </button>
        </div>
      </div>

      {/* --- Filters panel  --- */}
      <PartFilters
        isOpen={isFilterOpen}
        activeTab={activeTab}
        categories={categories}
        uniqueTypes={uniqueTypes as string[]}
        filterProducer={filterProducer}
        setFilterProducer={setFilterProducer}
        filterName={filterName}
        setFilterName={setFilterName}
        filterQr={filterQr}
        setFilterQr={setFilterQr}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterType={filterType}
        setFilterType={setFilterType}
        filterTransactionType={filterTransactionType}
        setFilterTransactionType={setFilterTransactionType}
        onClear={clearFilters}
      />

      {/* --- Content dependa on the active tab --- */}
      {activeTab === "warehouse" ? (
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
                        className={`transition-colors ${
                          isLowStock
                            ? "bg-red-50/50 hover:bg-red-50"
                            : "hover:bg-blue-50/50"
                        }`}
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
                              className={`text-lg font-bold ${
                                isLowStock ? "text-red-600" : "text-emerald-600"
                              }`}
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
                              className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
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
      ) : (
        <PartHistoryGlobalView
          parts={parts}
          categories={categories}
          filterProducer={filterProducer}
          filterName={filterName}
          filterQr={filterQr}
          filterCategory={filterCategory}
          filterTransactionType={filterTransactionType}
          onSelectFailure={(failureId) => {
            setSelectedFailureId(failureId);
          }}
        />
      )}

      {/* --- MODALE --- */}
      <PartDetailsModal
        isOpen={!!selectedPart}
        onClose={() => setSelectedPart(null)}
        part={selectedPart}
        categoryName={
          selectedPart ? getCategoryName(selectedPart.category_id) : ""
        }
        canManageParts={canManageParts}
        onEditClick={() => setIsEditModalOpen(true)}
        onCompatClick={() => {
          if (selectedPart) {
            setIsCompatModalOpen(true);
            fetchCompatibilities(selectedPart.id);
          }
        }}
        onAdjustStockClick={() => {
          setIsTakeModalOpen(true);
        }}
      />
      <TakePartModal
        isOpen={isTakeModalOpen}
        onClose={() => setIsTakeModalOpen(false)}
        part={selectedPart}
        onSuccess={() => {
          fetchWarehouseData();
          if (selectedPart) {
            api
              .get<Part>(`/parts/${selectedPart.id}`)
              .then((res) => setSelectedPart(res.data));
          }
        }}
      />

      <PartCompatibilityModal
        isOpen={isCompatModalOpen}
        onClose={() => setIsCompatModalOpen(false)}
        part={selectedPart}
        compatibleMachines={compatibleMachines}
        isLoading={isLoadingCompat}
      />

      {isEditModalOpen && selectedPart && (
        <PartEditModal
          part={selectedPart}
          categories={categories}
          setCategories={setCategories}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={fetchWarehouseData}
        />
      )}

      <CreatePartModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchWarehouseData}
      />
      {selectedFailureId && (
        <FailureDetailsModal
          failureId={selectedFailureId}
          isOpen={!!selectedFailureId}
          onClose={() => setSelectedFailureId(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
};
