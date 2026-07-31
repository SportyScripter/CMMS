import { Machine } from "./machine";
import {Role} from './auth';

export interface Order {
  id: number;
  description: string;
  scheduled_date: string;
  status: string;
  order_type: { id: number; name: string };
  order_machine?: { id: number; name: string };
  principal: { id: number; name: string; lastname: string };
  performed?: { id: number; name: string; lastname: string, Role: { id: number; name: string } };
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