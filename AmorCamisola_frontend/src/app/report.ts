import { Product } from "./product";
import { User } from "./user";

export interface Report {
    sent_by: User;
    reporting: User | null;
    product: Product | null;
    reasons: string;
    description: string;
  }
