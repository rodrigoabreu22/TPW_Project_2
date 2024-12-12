import { User } from "./user";

export interface Following {
    followed: User[],
    following: User[]
  }
