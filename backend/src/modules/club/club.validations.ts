import { NextFunction, Request, Response } from 'express';

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
