import React, { useState, useEffect } from "react";
import { api } from "../../../api/axiosConfig";
import { Part, PartCategory } from "../../../types/part";
import { useAuth } from "../../../context/AuthContext";
import { X, Loader2, Wrench, Search, CheckCircle2, Plus, Settings } from "lucide-react";
import { AddCategoryModal } from "./AddCategoryModal";
import { ManageCategoriesModal } from "./ManageCategoriesModal";
import {Machine} from "../../../types/machine";

interface PartEditModalProps {
  part: Part;
  categories: PartCategory[];
  setCategories: React.Dispatch<React.SetStateAction<PartCategory[]>>; 
  onClose: () => void;
  onUpdated: () => void;
}

export const PartEditModal: React.FC<PartEditModalProps> = ({
  part,
  categories,
  setCategories,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const role = user?.role.name || "";

  const isFullManager = ["Super Admin", "Admin", "Kierownik", "Magazynier", "Technik"].includes(role);
  const canEditQuantityOnly = ["Elektryk", "Mechanik"].includes(role);

  const [producer, setProducer] = useState(part.producer || "");
  const [name, setName] = useState(part.name || "");
  const [categoryId, setCategoryId] = useState(part.category_id.toString());
  const [type, setType] = useState(part.type || "");
  const [quantity, setQuantity] = useState(part.quantity.toString());
  const [minQuantity, setMinQuantity] = useState(part.min_quantity.toString());
  const [location, setLocation] = useState(part.location || "");
  const [price, setPrice] = useState(part.price ? part.price.toString() : "0");
  const [qrCode, setQrCode] = useState(part.qr_code || "");
  const [urlAddress, setUrlAddress] = useState(part.url_address || "");
  const [docs, setDocs] = useState(part.docs || "");

  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);
  const [initialMachineIds, setInitialMachineIds] = useState<number[]>([]);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [machineSearchQuery, setMachineSearchQuery] = useState("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCompatibilitiesAndMachines = async () => {
      try {
        const [machinesRes, compatRes] = await Promise.all([
          api.get<Machine[]>("/machines"),
          api.get(`/part-compatibilities/part/${part.id}`),
        ]);
        setAllMachines(machinesRes.data);
        
        const linkedIds = compatRes.data.map((item: any) => item.machine_id);
        setSelectedMachineIds(linkedIds);
        setInitialMachineIds(linkedIds);
      } catch (err) {
        console.error("Nie udało się pobrać danych kompatybilności.", err);
      }
    };
    fetchCompatibilitiesAndMachines();
  }, [part.id]);

  const toggleMachineSelection = (machineId: number) => {
    setSelectedMachineIds((prev) =>
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId]
    );
  };

  const filteredMachines = allMachines.filter(
    (m) =>
      m.name.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(machineSearchQuery.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.patch(`/parts/${part.id}`, {
        producer: producer || null,
        name: name,
        category_id: Number(categoryId),
        type: type,
        quantity: Number(quantity),
        min_quantity: Number(minQuantity),
        location: location,
        price: Number(price),
        qr_code: qrCode,
        url_address: urlAddress || null,
        docs: docs || null,
      });

      const toAdd = selectedMachineIds.filter((id) => !initialMachineIds.includes(id));
      const toRemove = initialMachineIds.filter((id) => !selectedMachineIds.includes(id));

      await Promise.all([
        ...toAdd.map((machineId) =>
          api.post("/part-compatibilities", {
            part_id: part.id,
            machine_id: machineId,
          })
        ),
        ...toRemove.map((machineId) =>
          api.delete(`/part-compatibilities/${part.id}/${machineId}`)
        ),
      ]);

      setSuccessMessage("Zmiany zostały zapisane pomyślnie!");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Wystąpił błąd podczas zapisywania zmian.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[20] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[90vh]">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              Edycja części: {part.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
            {successMessage && (
              <div className="flex items-center p-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 mr-2" /> {successMessage}
              </div>
            )}

            {error && (
              <div className="p-4 text-sm text-red-800 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {canEditQuantityOnly && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                Uwaga: Jako {role} masz uprawnienia do szybkiej edycji stanu magazynowego oraz przypisanych maszyn. Dane opisowe są zablokowane.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Informacje Podstawowe
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producent</label>
                  <input
                    type="text"
                    disabled={!isFullManager}
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa części</label>
                  <input
                    type="text"
                    disabled={!isFullManager}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                  <div className="flex gap-2">
                    <select
                      disabled={!isFullManager}
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {isFullManager && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors flex items-center justify-center focus:ring-2 focus:ring-blue-500 outline-none"
                          title="Dodaj nową kategorię"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsManageCategoriesModalOpen(true)}
                          className="px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors flex items-center justify-center focus:ring-2 focus:ring-gray-400 outline-none"
                          title="Zarządzaj kategoriami"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ / Klasyfikacja</label>
                  <input
                    type="text"
                    disabled={!isFullManager}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Magazyn i Zasoby
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Obecna ilość</label>
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. ilość</label>
                    <input
                      type="number"
                      min="0"
                      disabled={!isFullManager}
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokalizacja</label>
                  <input
                    type="text"
                    disabled={!isFullManager}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena jednostkowa (zł)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isFullManager}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kompatybilne urządzenia
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMachineModalOpen(true)}
                    className="w-full px-4 py-2.5 border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Zarządzaj urządzeniami ({selectedMachineIds.length} przypisano)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center shadow-sm disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz zmiany"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isMachineModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center text-lg">
                <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                Edycja kompatybilnych maszyn
              </h3>
              <button
                onClick={() => setIsMachineModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj maszyny po nazwie lub lokalizacji..."
                  value={machineSearchQuery}
                  onChange={(e) => setMachineSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-gray-50">
              {filteredMachines.map((machine) => {
                const isChecked = selectedMachineIds.includes(machine.id);
                return (
                  <div
                    key={machine.id}
                    onClick={() => toggleMachineSelection(machine.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? "bg-blue-50/70 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{machine.name}</p>
                      {machine.location && (
                        <p className="text-xs text-gray-500 mt-0.5">Lokalizacja: {machine.location}</p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Wybrano: <strong>{selectedMachineIds.length}</strong> maszyn
              </span>
              <button
                type="button"
                onClick={() => setIsMachineModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Gotowe
              </button>
            </div>
          </div>
        </div>
      )}

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={(newCategory) => {
          setCategories((prev) => [...prev, newCategory]);
          setCategoryId(newCategory.id.toString());
          setIsCategoryModalOpen(false);
        }}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesModalOpen}
        onClose={() => setIsManageCategoriesModalOpen(false)}
        categories={categories}
        setCategories={setCategories}
        onCategoryDeleted={(deletedId) => {
          if (categoryId === deletedId.toString()) setCategoryId("");
        }}
      />
    </>
  );
};