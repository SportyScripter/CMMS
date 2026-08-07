export interface PartCategory  {
    id: number;
    name: string;
}

export interface Part {
    id: number;
    category_id: number;
    producer: string ;
    name: string;
    type: string;
    quantity: number;
    min_quantity: number;
    location: string;
    price: number;
    url_address?: string | null;
    docs?: string | null;
    qr_code: string;
}

export interface PartHistoryItem {
  id: number;
  part_id: number;
  user_id: number;
  machine_id: number | null;
  failure_id: number | null;
  quantity_change: number;
  transaction_type: string;
  reason: string;
  created_at: string;
}