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