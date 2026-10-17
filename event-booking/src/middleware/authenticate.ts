
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import { HttpError } from "../utils/HttpError.js";

export type UserRole = "customer" | "admin";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * This middleware expects a trusted upstream authentication
 * integration to populate req.user after verifying the identity.
 *
 * Never populate req.user directly from client-supplied headers
 * or request-body values.
 */
export const requireAuthenticatedUser: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authenticatedRequest = req as AuthenticatedRequest;
  const user = authenticatedRequest.user;

  if (!user?.id || !user.role) {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  if (user.role !== "customer" && user.role !== "admin") {
    next(new HttpError(403, "Invalid user role"));
    return;
  }

  next();
};

export const requireRole = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    // (req as AuthenticatedRequest).user = JSON.parse('{"id":1, "name": "Satyam Verma", "role": "customer" }');
    const user = (req as AuthenticatedRequest).user;
    
    if (!user?.id || !user.role) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new HttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};
