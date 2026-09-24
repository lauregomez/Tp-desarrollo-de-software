import { Request, Response } from 'express';
import { matchLogService } from './matchLog.service';

export const matchLogController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const logs = await matchLogService.findAll();
    res.json(logs);
  },
};