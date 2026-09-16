import { NextFunction, Request, Response } from 'express';

// Middleware de sanitización: arma un objeto sólo con los campos permitidos
// y descarta los undefined. Evita que lleguen campos no previstos al service.
// Los null sí se conservan: son la forma de borrar un campo opcional.
export const sanitizeClubInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.sanitizedClubInput = {
    name: req.body.name,
    logoUrl: req.body.logoUrl,
    description: req.body.description,
    foundedYear: req.body.foundedYear,
  };

  Object.keys(req.body.sanitizedClubInput).forEach((key) => {
    if (req.body.sanitizedClubInput[key] === undefined) {
      delete req.body.sanitizedClubInput[key];
    }
  });

  next();
};
