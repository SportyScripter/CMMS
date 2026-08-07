export interface Machine {
  id: number;
  name: string;
  location?: string;
  qr_code?: string;
  status?: string;
}

export interface MachineFailuresModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: number | null;
  machineName: string;
}

export interface EditMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine | null;
  onUpdated: () => void; 
}