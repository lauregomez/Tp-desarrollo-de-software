import { NextFunction, Request, Response } from 'express';

// Middleware de sanitización: arma un objeto sólo con los campos permitidos
// y descarta los undefined. Evita que lleguen campos no previstos al service
// (por ejemplo un id o una relación mandados desde el cliente).
// Mismo patrón que sanitizeClubInput.
export const sanitizeCourtInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.sanitizedCourtInput = {
    name: req.body.name,
    address: req.body.address,
    capacity: req.body.capacity,
    clubId: req.body.clubId,
  };

  // Descartar los undefined es lo que permite el PUT parcial: un campo que
  // no vino no aparece en el objeto y el controller no lo valida ni lo pisa.
  Object.keys(req.body.sanitizedCourtInput).forEach((key) => {
    if (req.body.sanitizedCourtInput[key] === undefined) {
      delete req.body.sanitizedCourtInput[key];
    }
  });

  next();
};