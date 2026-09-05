import { NextFunction, Request, Response } from 'express';

// Middleware de sanitización: arma un objeto sólo con los campos permitidos
// y descarta los undefined. Evita que lleguen campos no previstos al service.
export const sanitizeClubInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.sanitizedClubInput = {
    name: req.body.name,
  };

  Object.keys(req.body.sanitizedClubInput).forEach((key) => {
    if (req.body.sanitizedClubInput[key] === undefined) {
      delete req.body.sanitizedClubInput[key];
    }
  });

  next();
};
