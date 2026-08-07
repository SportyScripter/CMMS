import React from "react";
import { Part } from "../../../types/part";
import { X, Link as LinkIcon, PackageSearch, Wrench, Edit, SlidersHorizontal } from "lucide-react";

interface PartDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: Part | null;
  categoryName: string;
  canManageParts: boolean;
  onEditClick: () => void;
  onCompatClick: () => void;
  onAdjustStockClick: () => void; 
}

export const PartDetailsModal: React.FC<PartDetailsModalProps> = ({
  isOpen,
  onClose,
  part,
  categoryName,
  canManageParts,
  onEditClick,
  onCompatClick,
  onAdjustStockClick,
}) => {
  if (!isOpen || !part) return null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900">Szczegóły części</h2>
            
            {/* Przycisk Edytuj Stan / Operacja magazynowa w centralnej części nagłówka */}
            <button
              type="button"
              onClick={onAdjustStockClick}
              className="flex items-center px-2 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Edytuj stan magazynowy
            </button>

            {canManageParts && (
              <button
                type="button"
                onClick={onEditClick}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Przejdź do edycji
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- CONTENT --- */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Producent</p>
              <p className="font-semibold text-gray-900">{part.producer || "Brak"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Nazwa</p>
              <p className="font-semibold text-gray-900">{part.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Kategoria</p>
              <p className="font-semibold text-gray-900">{categoryName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Typ (Klasyfikacja)</p>
              <p className="font-semibold text-gray-900">{part.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Kod QR</p>
              <p className="font-semibold text-gray-900">{part.qr_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Stan magazynowy / Minimum</p>
              <p className="font-medium">
                <span
                  className={
                    part.quantity <= part.min_quantity
                      ? "text-red-600 font-bold"
                      : "text-emerald-600 font-bold"
                  }
                >
                  {part.quantity} szt.
                </span>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-600">{part.min_quantity} szt.</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cena jednostkowa</p>
              <p className="font-medium text-gray-900">{part.price.toFixed(2)} zł</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ID Systemowe</p>
              <p className="font-medium text-gray-500">#{part.id}</p>
            </div>
          </div>

          {(part.url_address || part.docs || part.id) && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 flex-wrap">
              {part.url_address && (
                <a
                  href={part.url_address}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link do dostawcy
                </a>
              )}
              {part.docs && (
                <a
                  href={part.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <PackageSearch className="w-4 h-4 mr-2" />
                  Dokumentacja techniczna
                </a>
              )}
              <button
                type="button"
                onClick={onCompatClick}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium flex items-center transition-colors md:ml-auto cursor-pointer"
              >
                <Wrench className="w-4 h-4 mr-2" /> Pasuje do urządzeń
              </button>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};