import { Product } from "./product";
import { UserProfile } from "./user-profile";
import { User } from "./user";

export interface Offer {
    id: number,
    buyer: UserProfile,
    product: Product,
    value: number,
    payment_method: string,
    delivery_method: string,
    address: string,
    sent_by: User,
    offer_status: string,
    delivered: boolean
    paid: boolean
  }