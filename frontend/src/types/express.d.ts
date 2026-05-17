// Extends Express Request so TypeScript knows about our custom auth properties
// These are set by the authenticate middleware
declare namespace Express {
  interface Request {
    userId?: string;
    userEmail?: string;
  }
}