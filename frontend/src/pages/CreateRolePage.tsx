import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axiosConfig";
import { ShieldPlus, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export const CreateRolePage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/roles", { name, description });

      setSuccess(true);
      setName("");
      setDescription("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Wystąpił błąd podczas dodawania roli.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nagłówek i przycisk powrotu */}
      <div className="flex items-center mb-8">
        <Link
          to="/users"
          className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600"/>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShieldPlus className="w-8 h-8 text-blue-600 mr-3" />
            Dodaj nową rolę
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Utwórz nowy poziom uprawnień dla pracowników w systemie CMMS.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="flex items-center p-4 text-sm text-emerald-800 border border-emerald-300 rounded-lg bg-emerald-50">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
              Pomyślnie dodano nową rolę do systemu!
            </div>
          )}
          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nazwa roli *
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Starszy Mechanik"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Opis uprawnień
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótko opisz, do jakich modułów ta rola powinna mieć dostęp..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? "Zapisywanie..." : "Stwórz rolę"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
