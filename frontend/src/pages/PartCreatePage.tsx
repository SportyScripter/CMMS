import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axiosConfig";
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PartCategory } from "../types/part";

export const PartCreatePage = () => {
  const [categories, setCategories] = useState<PartCategory[]>([]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<PartCategory[]>("/part-categories");
        setCategories(response.data);
      } catch (error) {
        console.error(
          "Nie udało sie załadować listy kategorii. Odśwież stronę.",
          error,
        );
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/parts", {
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
      setSuccess(true);
      setName("");
      setCategoryId("");
      setType("");
      setQuantity("");
      setMinQuantity("");
      setLocation("");
      setPrice("");
      setQrCode("");
      setUrlAddress("");
      setDocs("");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Wystąpił błąd podczas dodawania części.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link
          to="/parts"
          className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PlusCircle className="w-8 h-8 text-blue-600 mr-3" />
            Dodaj Część
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Wrpowadź nową część do systemu magazynowego.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="flex items-center p-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Pomyślnie dodano nową
              część!
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                {" "}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ / Klasyfikacja *</label>
                <input required type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="np. Eksploatacyjne" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  kod QR
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
            </div>  
          </div>
          <div className="pt-4 flex justify-end border-t border-gray-100 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                  Zapisywanie...
                </>
              ) : (
                "Dodaj część do bazy"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
