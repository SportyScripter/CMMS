import React from "react";
import { Failure } from "../../../../types/failure";
import { calculateDowntime } from "../../../../utils/dateUtils";
import { Wrench, MapPin, User, Clock, Building2 } from "lucide-react";

interface FailureInfoGridProps {
  failure: Failure;
}

export const FailureInfoGrid: React.FC<FailureInfoGridProps> = ({
  failure,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
      {/* Machine */}
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs flex flex-col justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-1">
          <Wrench className="w-3.5 h-3.5 mr-1 text-blue-500" /> Maszyna
        </span>
        <span
          className="font-semibold text-gray-900 text-sm truncate"
          title={failure.machine.name}
        >
          {failure.machine.name}
        </span>
      </div>

      {/* Localization */}
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs flex flex-col justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-1">
          <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" /> Lokalizacja
        </span>
        <span
          className="font-medium text-gray-800 text-sm truncate"
          title={failure.machine.location || "Brak"}
        >
          {failure.machine.location || "Brak lokalizacji"}
        </span>
      </div>

      {/* Department */}
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs flex flex-col justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-1">
          <Building2 className="w-3.5 h-3.5 mr-1 text-purple-500" /> Departament
        </span>
        <span
          className="font-medium text-gray-800 text-sm truncate"
          title={failure.department.name}
        >
          {failure.department.name}
        </span>
      </div>

      {/* Submitter */}
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs flex flex-col justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-1">
          <User className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Zgłaszający
        </span>
        <span
          className="font-medium text-gray-800 text-sm truncate"
          title={`${failure.submitter.name} ${failure.submitter.lastname}`}
        >
          {failure.submitter.name} {failure.submitter.lastname}
        </span>
      </div>

      {/* Standing Time */}
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-1">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> Czas postoju
        </span>
        <span className="font-bold text-red-600 text-sm">
          {calculateDowntime(failure.created_at, failure.end_date)}
        </span>
      </div>
    </div>
  );
};
