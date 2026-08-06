import React, { useState } from "react";
import { X, AlertCircle, Loader2, Plus } from "lucide-react";
import { api } from "../../api/axiosConfig";

interface CreateMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateMachineModal: React.FC<CreateMachineModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  // Form states
  const [name, setName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("operational"); // Default status

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Early return if modal is not open
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/machines", {
        name: name.trim(),
        location: location.trim(),
        qr_code: qrCode.trim(),
        status: status,
      });

      // Reset form after successful creation
      setName("");
      setLocation("");
      setQrCode("");
      setStatus("operational");

      onCreated(); // Refresh the machine list
      onClose(); // Close the modal
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Wystąpił błąd podczas dodawania maszyny.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Dodaj Maszynę</h3>
              <p className="text-sm text-gray-500">
                Zarejestruj nowe urządzenie w systemie CMMS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg bg-white border border-gray-200 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form
          id="create-machine-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg border border-red-100 shadow-sm">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa Maszyny *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                placeholder="np. Wtryskarka 120T"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokalizacja *
              </label>
              <input
                required
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                placeholder="np. Hala A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod QR *
              </label>
              <input
                required
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                placeholder="np. QR-MAC-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Początkowy *
              </label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
              >
                <option value="operational">Sprawna (Operational)</option>
                <option value="under_maintenance">
                  Produkcja utrudniona (Under Maintenance)
                </option>
                <option value="out_of_service">Awaria (Out of Service)</option>
                <option value="off">Wyłączona (Off)</option>
                <option value="starting_up">
                  W trakcie uruchomienia (Starting Up)
                </option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Anuluj
          </button>
          <button
            form="create-machine-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-all shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              "Zarejestruj maszynę"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
