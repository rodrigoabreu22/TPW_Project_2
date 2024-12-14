import { User } from "./user";
import { Product } from "./product";

export interface Favorites {
    user: User;
    products: Product[];
  }