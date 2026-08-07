import React, { useState, useEffect } from "react";
import { api } from "../../../api/axiosConfig";
import {
  PlusCircle,
  Loader2,
  Wrench,
  Plus,
  Settings,
  X,
  AlertCircle,
} from "lucide-react";
import { PartCategory } from "../../../types/part";
import { AddCategoryModal } from "./AddCategoryModal";
import { ManageCategoriesModal } from "./ManageCategoriesModal";
import { AssignMachinesModal } from "./AssignMachinesModal";

interface Machine {
  id: number;
  name: string;
  location?: string;
}

interface CreatePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreatePartModal: React.FC<CreatePartModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  // Data states
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  // Form states
  const [producer, setProducer] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [urlAddress, setUrlAddress] = useState("");
  const [docs, setDocs] = useState("");
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);

  // Nested modals states
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] =
    useState(false);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories and machines when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [catRes, machRes] = await Promise.all([
            api.get<PartCategory[]>("/part-categories"),
            api.get<Machine[]>("/machines"),
          ]);
          setCategories(catRes.data);
          setMachines(machRes.data);
        } catch (err) {
          console.error("Failed to load initial data for part creation.", err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Early return if modal is not active
  if (!isOpen) return null;

  const toggleMachineSelection = (machineId: number) => {
    setSelectedMachineIds((prev) =>
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Create the part
      const partResponse = await api.post("/parts", {
        producer: producer ? producer : null,
        name: name,
        category_id: Number(categoryId),
        type: type,
        quantity: Number(quantity),
        min_quantity: Number(minQuantity),
        location: location,
        price: Number(price),
        qr_code: qrCode,
        url_address: urlAddress ? urlAddress : null,
        docs: docs ? docs : null,
      });

      const newPartId = partResponse.data.id;

      // 2. Assign compatible machines if any were selected
      if (selectedMachineIds.length > 0 && newPartId) {
        await Promise.all(
          selectedMachineIds.map((machineId) =>
            api.post("/part-compatibilities", {
              part_id: newPartId,
              machine_id: machineId,
            }),
          ),
        );
      }

      // 3. Reset form and close
      resetForm();
      onCreated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Wystąpił błąd podczas dodawania części.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setProducer("");
    setCategoryId("");
    setType("");
    setQuantity("");
    setMinQuantity("");
    setLocation("");
    setPrice("");
    setQrCode("");
    setUrlAddress("");
    setDocs("");
    setSelectedMachineIds([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl shrink-0">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xl">Dodaj Część</h3>
              <p className="text-sm text-gray-500">
                Wprowadź nową część do systemu magazynowego.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg bg-white border border-gray-200 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <form
            id="create-part-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Informacje Podstawowe
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producent / Dostawca
                  </label>
                  <input
                    required
                    type="text"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    placeholder="np. Balluff"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa części
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Łożysko kulkowe 6205 ZZ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="" disabled>
                        Wybierz kategorię...
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
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
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ / Klasyfikacja *
                  </label>
                  <input
                    required
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="np. Eksploatacyjne"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod QR
                  </label>
                  <input
                    required
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="np. QR123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Warehouse and Extras */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Magazyn i Dodatki
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obecna ilość
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimalna ilość
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokalizacja
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="np. Regał 2B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cena
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres URL do dostawcy
                  </label>
                  <input
                    type="text"
                    value={urlAddress}
                    onChange={(e) => setUrlAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="np. https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link do dokumentacji
                  </label>
                  <input
                    type="text"
                    value={docs}
                    onChange={(e) => setDocs(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="np. https://example.com/docs"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kompatybilne urządzenia
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMachineModalOpen(true)}
                    className="w-full px-4 py-2.5 border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Przypisz urządzenia ({selectedMachineIds.length} wybrano)
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Anuluj
          </button>
          <button
            form="create-part-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              "Dodaj część do bazy"
            )}
          </button>
        </div>
      </div>

      {/* --- Nested Modals --- */}
      <AssignMachinesModal
        isOpen={isMachineModalOpen}
        onClose={() => setIsMachineModalOpen(false)}
        machines={machines}
        selectedMachineIds={selectedMachineIds}
        toggleMachineSelection={toggleMachineSelection}
      />

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
    </div>
  );
};
