import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import {
  OrderType,
  ManageOrderTypesModalProps,
} from "../../types/order-calendar";

export const ManageOrderTypesModal: React.FC<ManageOrderTypesModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [types, setTypes] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- CREATE STATE ---
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // --- FETCH DATA ---
  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<OrderType[]>("/order-types");
      setTypes(response.data);
    } catch (err) {
      setError("Nie udało się pobrać typów zleceń.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTypes();
      setError("");
      setNewName("");
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- HANDLERS ---

  // Create
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/order-types", { name: newName.trim() });
      setNewName("");
      fetchTypes();
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Błąd podczas dodawania typu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Edit Mode
  const startEditing = (type: OrderType) => {
    setEditingId(type.id);
    setEditName(type.name);
  };

  // Update
  const handleUpdateType = async (id: number) => {
    if (!editName.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await api.patch(`/order-types/${id}`, { name: editName.trim() });
      setEditingId(null);
      fetchTypes();
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Błąd podczas aktualizacji typu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete
  const handleDeleteType = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć typ zlecenia "${name}"? Może to wpłynąć na powiązane zlecenia.`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.delete(`/order-types/${id}`);
      fetchTypes();
      onUpdated();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Nie udało się usunąć typu. Prawdopodobnie jest używany w istniejących zleceniach.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[85vh]">
        {/* --- HEADER --- */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center text-lg">
            <Settings2 className="w-5 h-5 mr-2 text-blue-600" />
            Zarządzaj typami zleceń
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- MODAL BODY --- */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
            </div>
          )}

          {/* ADD NEW SECTION */}
          <form onSubmit={handleAddType} className="flex gap-2 mb-6">
            <input
              type="text"
              required
              placeholder="Wpisz nazwę nowego typu (np. Przegląd)..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center text-sm shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Plus className="w-4 h-4 mr-1.5" />
              )}
              Dodaj
            </button>
          </form>

          {/* LIST SECTION */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Istniejące typy
            </div>

            {isLoading && types.length === 0 ? (
              <div className="p-8 flex justify-center text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : types.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Brak zdefiniowanych typów.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto bg-white">
                {types.map((type) => (
                  <li
                    key={type.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* View/Edit mode toggle */}
                    {editingId === type.id ? (
                      <div className="flex-1 mr-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-blue-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateType(type.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                          title="Zapisz"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-500 hover:bg-gray-200 rounded transition-colors"
                          title="Anuluj"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-700">
                          {type.name}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(type)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edytuj"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteType(type.id, type.name)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Usuń"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
