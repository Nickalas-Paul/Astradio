declare module "express-slow-down" {
  import type { RequestHandler } from "express";
  interface Options {
    windowMs?: number;
    delayAfter?: number;
    delayMs?: number | ((ip: string, attempts: number) => number);
    maxDelayMs?: number;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: any, res: any) => string;
    skip?: (req: any, res: any) => boolean;
    requestWasSuccessful?: (req: any, res: any) => boolean;
    onLimitReached?: (req: any, res: any, opts: Options) => void;
  }
  function slowDown(options?: Options): RequestHandler;
  export = slowDown;
}
