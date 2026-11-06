import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'careerbridge_production_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    organization?: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: UserRole; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: No authentication token provided.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    };

    const user = await db.users.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid or account deactivated.',
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      organization: user.organization,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: err.message,
    });
  }
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s).`,
      });
    }
    next();
  };
}
