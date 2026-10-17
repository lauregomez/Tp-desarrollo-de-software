import { NextFunction, Request, Response } from 'express';

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

  Object.keys(req.body.sanitizedCourtInput).forEach((key) => {
    if (req.body.sanitizedCourtInput[key] === undefined) {
      delete req.body.sanitizedCourtInput[key];
    }
  });

  next();
};