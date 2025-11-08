import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tagController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { usageCount: 'desc' }
    });

    res.json({
      success: true,
      data: tags
    });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { name, color } = req.body;

    const tag = await prisma.tag.create({
      data: {
        userId,
        name,
        color: color || '#757575'
      }
    });

    res.status(201).json({
      success: true,
      data: tag
    });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const tag = await prisma.tag.updateMany({
      where: { id, userId },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Tag updated successfully'
    });
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await prisma.tag.deleteMany({
      where: { id, userId }
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  })
};
