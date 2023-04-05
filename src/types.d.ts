import * as http from 'http';
import { DecodeUser } from './service/auth';

declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: DecodeUser;
  }
}
