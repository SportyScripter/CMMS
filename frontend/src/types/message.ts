import { User } from "./auth";

export interface MessageRecipient {
  message_id: number;
  recipient_id: number;
  is_read: boolean;
  recipient: User;
}

export interface Message {
  id: number;
  parent_message_id?: number | null;
  subject: string;
  content: string;
  sender_id: number;
  role_id?: number | null;
  department_id?: number | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
  sender: User;
  recipients: MessageRecipient[];
}

export interface MessageCreate {
  subject: string;
  content: string;
  recipient_ids?: number[];
  role_id?: number | null;
  department_id?: number | null;
  parent_message_id?: number | null;
}