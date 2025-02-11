import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        [key: string]: any;
    };
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
):any => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded as { userId: string };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}; 
// middleware/authMiddleware.ts
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// export const authenticateToken = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: 'Authentication token required' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//         req.user = decoded as jwt.JwtPayload & { userId: string };
//         next();
//     } catch (error) {
//         return res.status(403).json({ message: 'Invalid or expired token' });
//     }
// };