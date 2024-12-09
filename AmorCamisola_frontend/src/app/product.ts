import { User } from "./user";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    team: string;
    seller: User | null;
    sold: boolean;
    is_active: boolean;
    image: string;
    image_base64: string;
  }
