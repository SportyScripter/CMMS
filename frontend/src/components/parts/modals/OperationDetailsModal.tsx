import React from "react";
import {
  X,
  User,
  Clock,
  Link,
  Package,
  Hash,
  MapPin,
  QrCode,
  Building,
  Boxes,
} from "lucide-react";
import { Part } from "../../../types/part";

const transactionTypeTranslations: Record<string, string> = {
  FAILURE: "Zużycie (Awaria)",
  DELIVERY: "Dostawa",
  MANUAL_DISPATCH: "Pobranie ręczne",
  RETURN: "Zwrot",
  ADJUSTMENT: "Korekta stanu",
};

interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: any;
  parts: Part[];
}

export const OperationDetailsModal: React.FC<OperationDetailsModalProps> = ({
  isOpen,
  onClose,
  operation,
  parts,
}) => {
  if (!isOpen || !operation) return null;
  const part = parts.find((p) => p.id === operation.part_id);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">
            Szczegóły operacji #{operation.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* --- CONTENT --- */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Common part information */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Informacje o zdarzeniu
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <InfoItem
                icon={<Clock />}
                label="Data i czas"
                value={new Date(operation.created_at).toLocaleString("pl-PL")}
              />
              <InfoItem
                icon={<User />}
                label="Użytkownik ID"
                value={`#${operation.user_id}`}
              />
              <InfoItem
                icon={<Hash />}
                label="Typ operacji"
                value={
                  transactionTypeTranslations[operation.transaction_type] ||
                  operation.transaction_type
                }
              />
              <InfoItem
                icon={<Package />}
                label="Zmiana stanu"
                value={`${operation.quantity_change > 0 ? "+" : ""}${operation.quantity_change} szt.`}
              />
            </div>
          </div>

          {/* Part details section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Dane części
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <InfoItem
                icon={<Package />}
                label="Nazwa części"
                value={part ? part.name : `Część #${operation.part_id}`}
              />
              <InfoItem
                icon={<Building />}
                label="Producent"
                value={part?.producer || "Brak"}
              />
              <InfoItem
                icon={<QrCode />}
                label="Kod QR"
                value={part?.qr_code || "Brak"}
              />
              <InfoItem
                icon={<MapPin />}
                label="Lokalizacja"
                value={part?.location || "Brak"}
              />
              <InfoItem
                icon={<Boxes />}
                label="Aktualny stan magazynowy"
                value={part?.quantity.toString() || "Brak"}
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 flex items-center mb-1">
                  <Link className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Link do dostawcy
                </span>
                {part?.url_address ? (
                  <a
                    href={part.url_address}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate inline-flex items-center"
                    title={part.url_address}
                  >
                    Otwórz link
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-gray-900">
                    Brak
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reason / Description */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/60">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Opis / Powód operacji
            </span>
            <p className="text-sm text-gray-800 mt-1 font-medium">
              {operation.reason || "Brak opisu"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-400 flex items-center mb-1">
      {React.cloneElement(icon as React.ReactElement, {
        className: "w-3 h-3 mr-1",
      })}{" "}
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);
