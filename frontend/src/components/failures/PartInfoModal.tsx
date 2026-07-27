import React from "react";
import { X, Package, MapPin, Tag, Barcode, ExternalLink } from "lucide-react";
import { Part } from "../../types/part";

interface PartInfoModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartInfoModal: React.FC<PartInfoModalProps> = ({
  part,
  isOpen,
  onClose,
}) => {
  // if modal is not open or no part selected, render nothing
  if (!isOpen || !part) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <h3 className="font-bold text-gray-900 flex items-center text-base">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            Podgląd części
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/*Details content */}
        <div className="p-6 space-y-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Nazwa części
            </p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {part.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-gray-400" /> Producent
              </p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {part.producer || "Brak danych"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-gray-400" /> Typ
              </p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {part.type || "Brak danych"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />{" "}
                Lokalizacja
              </p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {part.location || "Brak danych"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <Barcode className="w-3.5 h-3.5 mr-1 text-gray-400" /> Kod QR
              </p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {part.qr_code || "Brak danych"}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div>
              <span className="text-xs text-gray-500 block">Obecny stan</span>
              <span className="text-base font-bold text-emerald-600">
                {part.quantity} szt.
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Cena jedn.</span>
              <span className="text-base font-bold text-gray-800">
                {part.price} zł
              </span>
            </div>
          </div>
          {(part.url_address || part.docs) && (
            <div className="pt-2 flex gap-2">
              {part.url_address && (
                <a
                  href={part.url_address}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-xs flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Sklep
                </a>
              )}
              {part.docs && (
                <a
                  href={part.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-xs flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Dokumentacja
                </a>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end ">
            <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-xs font-medium transition-colors"
            >
                Zamknij
            </button>
        </div>
      </div>
    </div>
  );
};
