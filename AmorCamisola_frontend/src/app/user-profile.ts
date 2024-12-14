import { User } from "./user";

export interface UserProfile {
    id: number;
    user: User;
    address: string;
    phone: string;
    image: string;
    wallet: number;
}