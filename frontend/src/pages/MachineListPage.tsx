import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axiosConfig";
import { Machine } from "../types/machine";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Settings2,
  Loader2,
  AlertCircle,
  Plus,
  Filter,
  X,
  CalendarDays,
  Activity,
  Edit,
} from "lucide-react";

export const MachineListPage = () => {
  const { user } = useAuth();
  const canManageMachines =
    user?.role?.name === "Super Admin" ||
    user?.role?.name === "Admin" ||
    user?.role?.name === "Kierownik";
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterQr, setFilterQr] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await api.get<Machine[]>("/machines");
        setMachines(response.data);
      } catch (err: any) {
        setError(
          "Nie udało się pobrać listy maszyn. Sprawdź połączenie z serwerem.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchMachines();
  }, []);

  const uniqueLocations = Array.from(
    new Set(machines.map((machine) => machine.location)),
  );
  const uniqueStatuses = Array.from(
    new Set(machines.map((machine) => machine.status)),
  );

  const filteredMachines = machines.filter((machine) => {
    const matchName = machine.name
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const matchQr = machine.qr_code
      .toLowerCase()
      .includes(filterQr.toLowerCase());
    const matchLocation =
      filterLocation === "" || machine.location === filterLocation;
    const matchStatus = filterStatus === "" || machine.status === filterStatus;

    return matchName && matchQr && matchLocation && matchStatus;
  });

  const clearFilters = () => {
    setFilterName("");
    setFilterQr("");
    setFilterLocation("");
    setFilterStatus("");
  };

  const getCardColorStyles = (status: string) => {
    switch (status.toLocaleLowerCase()) {
      case "operational":
      case "sprawna":
        return "bg-emerald-100 border-emerald-200 text-emerald-900";
      case "out of service":
      case "awaria":
        return "bg-red-200 border-red-300 text-red-900";
      case "under maintenance":
      case "produkcja utrudniona":
        return "bg-amber-200 border-amber-300 text-amber-900";
      case "off":
      case "wyłączona":
        return "bg-gray-200 border-gray-400 text-gray-500 grayscale opacity-90";
      default:
        return "bg-white border-gray-200 text-gray-900";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Link
            to="/"
            className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings2 className="w-8 h-8 text-blue-600 mr-3" />
              Park Maszynowy
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Przeglądaj wszystkie maszyny w systemie CMMS.
            </p>
          </div>
        </div>
        <div className="flex item-center gap-4">
          {!isLoading && !error && machines.length > 0 && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isFilterOpen
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtruj
            </button>
          )}
          {canManageMachines && (
            <Link
              to="machines/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Maszynę
            </Link>
          )}
        </div>
      </div>
      {isFilterOpen && (
        <div className="bf-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Kryteria wyszukiwania
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-600 flex item-center"
            >
              <X className="w-4 h-4 mr-1" />
              Wyczyść filtry
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Nazwa Maszyny
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="np. Prasa 25"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Kod QE
              </label>
              <input
                type="text"
                value={filterQr}
                onChange={(e) => setFilterQr(e.target.value)}
                placeholder="np. QE-12345"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Lokalizacja
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Wszystkie lokalizacje</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Wszystkie statusy</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p>Ładowanie parku maszyn...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-12 text-red-600 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="w-6 h-6 mr-2" />
          {error}
        </div>
      ) : filteredMachines.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          <Settings2 className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">Brak maszyn</p>
          <p className="mt-1">
            Nie znaleziono maszyn spełniających kryteria wyszukiwania.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className={`relative flex flex-col p-5 rounded-2xl border shadow-sm transition-transform hover:scale-[1.02] ${getCardColorStyles(machine.status)}`}
            >
              {canManageMachines && (
                <button
                  className="absolute top-4 right-4 p-2 bg-white/60 hover:bg-white rounded-full transition-colors shadow-sm"
                  title="Edytuj Maszynę"
                >
                  <Edit className="w-4 h-4 text-gray-700" />
                </button>
              )}
              <div className="mb-4 pr-8">
                <span className="inline-block px-2 py-1 bg-white/60 rounded-md text-xs font-bold uppercase tracking-wider mb-2 shadow-sm border border-black/5">
                  Lokalizacja: {machine.location}
                </span>
                <h3 className="text-xl font-bold mb-1">{machine.name}</h3>
                <p className="font-mono text-sm opacity-80">
                  QR: {machine.qr_code}
                </p>
                <p className="text-sm font-medium mt-2 capitalize">
                  Status: {machine.status}
                </p>
              </div>
              <div className="mt-auto pt-4 flex gap-3 border-t border-black/5">
                <Link
                  to={`/machines/${machine.id}/calendar`}
                  className="flex-1 flex items-center justify-center px-2 py-2 bg-white/70 hover:bg-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Kalendarz
                </Link>
                <Link
                  to={`/machines/${machine.id}/failures`}
                  className="flex-1 flex items-center justify-center px-2 py-2 bg-white/70 hover:bg-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Awarie
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
