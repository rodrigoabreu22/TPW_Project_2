import { Product } from "./product";
import { User } from "./user";
import { UserProfile } from "./user-profile";

export interface Report {
    id : number,
    sent_by: UserProfile | null;
    reporting: UserProfile | null;
    product: Product | null;
    reasons: string;
    description: string;
  }
