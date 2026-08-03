import { useState, useEffect } from "react";
import {
  X,
  AlertCircle,
  Trash2,
  Save,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { api } from "../../api/axiosConfig";
import { Machine } from "../../types/machine";
import { STATUS_CONFIG, translateStatus } from "../../utils/statusUtils";
import { EditMachineModalProps } from "../../types/machine";

export const EditMachineModal: React.FC<EditMachineModalProps> = ({
  isOpen,
  onClose,
  machine,
  onUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    qr_code: "",
    status: "",
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fill out the form with your current data when opening
  useEffect(() => {
    if (machine && isOpen) {
      setFormData({
        name: machine.name || "",
        location: machine.location || "",
        qr_code: machine.qr_code || "",
        status: machine.status || "",
      });
      setError("");
      setShowDeleteConfirm(false);
      setDeleteInput("");
    }
  }, [machine, isOpen]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Handle update submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        qr_code: formData.qr_code.trim(),
        status: formData.status,
      };
      await api.patch(`/machines/${machine.id}`, payload);
      onUpdated();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response.data.detail ||
            "Błąd zapisu. Prawdopodobnie nazwa lub kod QR już istnieje.",
        );
      } else {
        setError(
          "Wystąpił błąd podczas aktualizacji maszyny. Spróbuj ponownie.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete machine handler
  const handleDelete = async () => {
    if (!machine) return;
    setIsDeleting(true);
    setError("");
    try {
      await api.delete(`/machines/${machine.id}`);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(
        "Nie udało się usunąć maszyny. Sprawdź, czy nie ma przypisanych awarii.",
      );
    } finally {
      setIsDeleting(false);
    }
  };
  if (!isOpen || !machine) return null;
  const availableStatuses = Object.keys(STATUS_CONFIG).filter(
    (s) => s !== "CLOSE",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            Edycja maszyny: <span className="text-indigo-600">{machine.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="edit-machine-form" onSubmit={handleUpdate}>
            {/* GRID 2 COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* This column shows the current machine data for reference */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                  Obecne dane (Podgląd)
                </h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nazwa</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm">
                    {machine.name}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lokalizacja</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm">
                    {machine.location || <span className="italic opacity-50">Brak</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Kod QR</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm">
                    {machine.qr_code || <span className="italic opacity-50">Brak</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium">
                    {translateStatus(machine.status)}
                  </div>
                </div>
              </div>

              {/* This arrow is purely decorative and only shows on medium+ screens */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm z-10">
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>

              {/* New data (Edit form) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
                  Nowe dane (Edycja)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nazwa</label>
                  <input
                    type="text"
                    name="name"
                    required
                    maxLength={255}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lokalizacja</label>
                  <input
                    type="text"
                    name="location"
                    maxLength={255}
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kod QR</label>
                  <input
                    type="text"
                    name="qr_code"
                    maxLength={255}
                    value={formData.qr_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  >
                    {availableStatuses.map((key) => (
                      <option key={key} value={key}>
                        {translateStatus(key)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>

          {/* Delete confirmation section */}
          {showDeleteConfirm && (
            <div className="mt-8 p-5 border border-red-200 bg-red-50 rounded-xl animate-in fade-in slide-in-from-bottom-2">
              <h4 className="text-red-800 font-bold mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Potwierdzenie usunięcia maszyny
              </h4>
              <p className="text-sm text-red-700 mb-4">
                Usunięcie jest nieodwracalne. Aby potwierdzić, przepisz dokładnie nazwę maszyny: 
                <span className="font-bold ml-1 bg-red-100 px-2 py-0.5 rounded select-all">{machine.name}</span>
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Przepisz nazwę..."
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="flex-1 max-w-xs px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== machine.name || isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Usuń bezpowrotnie
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput('');
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          {/* LEFT SIDE - delete button */}
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń maszynę
            </button>
          ) : (
            <div /> 
          )}

          {/* RIGHT SIDE - Cancel / Save */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              form="edit-machine-form"
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Zapisz zmiany
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
