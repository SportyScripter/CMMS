import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { api } from "../api/axiosConfig";
import { PartCategory } from "../types/part";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: PartCategory) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    setError("");
    try {
      const response = await api.post("/part-categories", { name: newCategoryName });
      onSuccess(response.data);
      setNewCategoryName("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Nie udało się dodać nowej kategorii.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center text-base">
            <Plus className="w-5 h-5 text-blue-600 mr-2" />
            Dodaj nową kategorię
          </h3>
          <button
            type="button"
            onClick={() => {
              onClose();
              setError("");
              setNewCategoryName("");
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleAdd} className="p-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa kategorii</label>
            <input
              autoFocus
              required
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="np. Elektronika"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newCategoryName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};