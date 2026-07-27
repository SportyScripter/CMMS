import { User } from "./auth";
import { Machine } from "./machine";
import { Part } from "./part";

export interface Department {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  failure_id?: number;
  order_id?: number;
  file_path: string;
  uploaded_at: string;
}

export interface FailurePart {
  failure_id: number;
  part_id: number;
  quantity_used: number;
  part: Part;
}

export interface Failure {
  id: number;
  machine_id: number;
  department_id: number;
  submitter_id: number;
  recipient_id: number | null;
  failure_description: string;
  repair_description: string | null;
  status: string;
  comment: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  
  submitter: User;
  recipient: User | null;
  machine: Machine;
  department: Department;
  used_parts: FailurePart[];
  attachments: Attachment[];
}