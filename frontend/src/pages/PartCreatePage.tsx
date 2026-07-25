import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axiosConfig";
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  Loader2,
  Wrench,
  Search,
  X,
} from "lucide-react";
import { PartCategory } from "../types/part";

interface Machine {
  id: number;
  name: string;
  location?: string;
}

export const PartCreatePage = () => {
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

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
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [machineSearchQuery, setMachineSearchQuery] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, machRes] = await Promise.all([
          api.get<PartCategory[]>("/part-categories"),
          api.get<Machine[]>("/machines"),
        ]);
        setCategories(catRes.data);
        setMachines(machRes.data);
      } catch (err) {
        console.error("Nie udało się załadować danych początkowych.", err);
      }
    };
    fetchData();
  }, []);

  const toggleMachineSelection = (machineId: number) => {
    setSelectedMachineIds((prev) =>
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId]
    );
  };

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
      (m.location &&
        m.location.toLowerCase().includes(machineSearchQuery.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
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

      if (selectedMachineIds.length > 0 && newPartId) {
        await Promise.all(
          selectedMachineIds.map((machineId) =>
            api.post("/part-compatibilities", {
              part_id: newPartId,
              machine_id: machineId,
            })
          )
        );
      }

      setSuccess(true);
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
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Wystąpił błąd podczas dodawania części."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center mb-8">
        <Link
          to="/parts"
          className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-blue-400 hover:text-blue-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PlusCircle className="w-8 h-8 text-blue-600 mr-3" />
            Dodaj Część
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Wprowadź nową część do systemu magazynowego.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="flex items-center p-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Pomyślnie dodano nową
              część wraz z powiązaniami!
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres URL
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

          <div className="pt-4 flex justify-end border-t border-gray-100 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center shadow-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                "Dodaj część do bazy"
              )}
            </button>
          </div>
        </form>
      </div>

      {isMachineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center text-lg">
                <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                Wybierz kompatybilne urządzenia
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
              {filteredMachines.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  Nie znaleziono żadnych maszyn spełniających kryteria.
                </p>
              ) : (
                filteredMachines.map((machine) => {
                  const isChecked = selectedMachineIds.includes(machine.id);
                  return (
                    <div
                      key={machine.id}
                      onClick={() => toggleMachineSelection(machine.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-blue-50/70 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {machine.name}
                        </p>
                        {machine.location && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Lokalizacja: {machine.location}
                          </p>
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
                })
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Wybrano: <strong>{selectedMachineIds.length}</strong> maszyn
              </span>
              <button
                type="button"
                onClick={() => setIsMachineModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                Zatwierdź wybór
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};