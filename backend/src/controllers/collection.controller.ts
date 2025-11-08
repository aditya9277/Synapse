import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const collectionController = {
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { name, description, color, icon } = req.body;

    const collection = await prisma.collection.create({
      data: {
        userId,
        name,
        description,
        color: color || '#1976d2',
        icon: icon || 'folder'
      }
    });

    res.status(201).json({
      success: true,
      data: collection
    });
  }),

  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            content: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: collections
    });
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collection = await prisma.collection.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            content: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection
    });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const collection = await prisma.collection.updateMany({
      where: { id, userId },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Collection updated successfully'
    });
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await prisma.collection.deleteMany({
      where: { id, userId }
    });

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  }),

  addItem: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { contentId } = req.body;

    const item = await prisma.collectionItem.create({
      data: {
        collectionId: id,
        contentId
      }
    });

    res.status(201).json({
      success: true,
      data: item
    });
  }),

  removeItem: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, contentId } = req.params;

    await prisma.collectionItem.deleteMany({
      where: {
        collectionId: id,
        contentId
      }
    });

    res.json({
      success: true,
      message: 'Item removed from collection'
    });
  })
};
