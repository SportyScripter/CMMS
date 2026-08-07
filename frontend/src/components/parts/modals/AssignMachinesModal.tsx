import React, { useState } from "react";
import { Wrench, Search, X } from "lucide-react";

interface Machine {
  id: number;
  name: string;
  location?: string;
}

interface AssignMachinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  selectedMachineIds: number[];
  toggleMachineSelection: (machineId: number) => void;
}

export const AssignMachinesModal: React.FC<AssignMachinesModalProps> = ({
  isOpen,
  onClose,
  machines,
  selectedMachineIds,
  toggleMachineSelection,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center text-lg">
            <Wrench className="w-5 h-5 text-blue-600 mr-2" />
            Wybierz kompatybilne urządzenia
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Szukaj maszyny po nazwie lub lokalizacji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-gray-50">
          {filteredMachines.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">Nie znaleziono żadnych maszyn.</p>
          ) : (
            filteredMachines.map((machine) => {
              const isChecked = selectedMachineIds.includes(machine.id);
              return (
                <div
                  key={machine.id}
                  onClick={() => toggleMachineSelection(machine.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isChecked ? "bg-blue-50/70 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{machine.name}</p>
                    {machine.location && <p className="text-xs text-gray-500 mt-0.5">Lokalizacja: {machine.location}</p>}
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
          <span className="text-xs text-gray-500">Wybrano: <strong>{selectedMachineIds.length}</strong> maszyn</span>
          <button onClick={onClose} type="button" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
            Zatwierdź wybór
          </button>
        </div>
      </div>
    </div>
  );
};