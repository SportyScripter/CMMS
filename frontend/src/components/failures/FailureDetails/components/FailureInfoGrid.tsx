import React from "react";
import { Failure } from "../../../../types/failure";
import { calculateDowntime } from "../../../../utils/dateUtils";

interface FailureInfoGridProps {
  failure: Failure;
}

export const FailureInfoGrid: React.FC<FailureInfoGridProps> = ({ failure }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Maszyna
        </p>
        <p className="font-medium text-gray-900 mt-0.5">
          {failure.machine.name}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Zgłaszający
        </p>
        <p className="font-medium text-gray-900 mt-0.5">
          {failure.submitter.name} {failure.submitter.lastname}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Czas postoju
        </p>
        <p className="font-bold text-red-600 mt-0.5">
          {calculateDowntime(failure.created_at, failure.end_date)}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Departament
        </p>
        <p className="font-medium text-gray-900 mt-0.5">
          {failure.department.name}
        </p>
      </div>
    </div>
  );
};