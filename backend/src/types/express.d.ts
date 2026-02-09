import { AccountPayload } from "../utils/tokenManager";

export interface Params {
  id: string;
}
declare global {
  namespace Express {
    interface Request {
      account?: AccountPayload;
    }
  }
}

export {};