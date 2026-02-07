import { AccountPayload } from "../utils/tokenManager";


declare global {
  namespace Express {
    interface Request {
      account?: AccountPayload;
    }
  }
}

export {};