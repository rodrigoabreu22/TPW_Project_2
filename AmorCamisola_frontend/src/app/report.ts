import { Product } from "./product";
import { User } from "./user";
import { UserProfile } from "./user-profile";

export interface Report {
    sent_by: UserProfile;
    reporting: UserProfile | null;
    product: Product | null;
    reasons: string;
    description: string;
  }
