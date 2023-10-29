declare global {
  namespace Express {
    interface Request {
      organizationId?: string | null;
    }
  }
}
