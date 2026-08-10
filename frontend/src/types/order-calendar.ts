import { Machine } from "./machine";

export interface Order {
  id: number;
  description: string;
  scheduled_date: string;
  started_at?: string | null;   
  completed_at?: string | null; 
  priority: string;
  status: string;
  comments?: string | null;             
  execution_report?: string | null;     
  pause_reason?: string | null;         
  is_machine_operational?: boolean;     
  work_time_minutes?: number;           
  last_resumed_at?: string | null;
  order_type: { id: number; name: string };
  order_machine?: { id: number; name: string };
  assigned_role_id?: number | null;
  assigned_role?: { id: number; name: string } | null;
  principal: {
    id: number;
    name: string;
    lastname: string;
    role: { id: number; name: string };
  };
  performed?: {
    id: number;
    name: string;
    lastname: string;
    role: { id: number; name: string };
  };
  checklist_items?: {
    id: number;
    task_description: string;
    status: string;
    comments: string;
  }[];
}

export interface ManageOrderTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export interface OrderType {
  id: number;
  name: string;
}

export interface AddChecklistItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tasks: string[]) => void;
  machines: Machine[];
  orderTypes: OrderType[];
}

export interface OrderDetailsChecklistModalProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export interface MachineOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: number | null;
  machineName: string;
}
