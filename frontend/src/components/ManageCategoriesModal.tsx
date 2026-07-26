import React, { useState } from "react";
import { Settings, X, Save, Edit2, Trash2 } from "lucide-react";
import { api } from "../api/axiosConfig";
import { PartCategory } from "../types/part";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PartCategory[];
  setCategories: React.Dispatch<React.SetStateAction<PartCategory[]>>;
  onCategoryDeleted: (deletedId: number) => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  setCategories,
  onCategoryDeleted,
}) => {
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę kategorię?")) return;
    setIsLoading(true);
    setError("");
    try {
      await api.delete(`/part-categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      onCategoryDeleted(id);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Nie udało się usunąć kategorii.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingCategoryName.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await api.patch(`/part-categories/${id}`, { name: editingCategoryName });
      setCategories((prev) => prev.map((cat) => (cat.id === id ? response.data : cat)));
      setEditingCategoryId(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Nie udało się zaktualizować kategorii.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center text-base">
            <Settings className="w-5 h-5 text-gray-600 mr-2" />
            Zarządzaj kategoriami
          </h3>
          <button
            type="button"
            onClick={() => {
              onClose();
              setError("");
              setEditingCategoryId(null);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">Brak zapisanych kategorii.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {categories.map((category) => (
                <li key={category.id} className="p-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  {editingCategoryId === category.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        autoFocus
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        onClick={() => handleUpdate(category.id)}
                        disabled={isLoading}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        disabled={isLoading}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                            setError("");
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
            Zamknij okno
          </button>
        </div>
      </div>
    </div>
  );
};