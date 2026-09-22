import { Response, NextFunction } from 'express';
import { AuthRequest, RoleName } from './auth.types';

// Tipado con RoleName y no con string: un tipo como authorize('ADMN')
// falla al compilar en vez de bloquear la ruta para todos en silencio.
export function authorize(...allowedRoles: RoleName[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({ message: 'No tenés permisos para realizar esta acción' });
      return;
    }

    next();
  };
}
