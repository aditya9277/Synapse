import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { contentService } from '../services/content.service';
import { createContentSchema, updateContentSchema, queryContentSchema } from '../schemas/content.schema';
import { asyncHandler } from '../middleware/errorHandler';

export const contentController = {
  create: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const validatedData = createContentSchema.parse(req.body);
    const userId = req.user!.userId;

    const content = await contentService.create(userId, validatedData);

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
  }),

  getAll: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const query = queryContentSchema.parse(req.query);

    const result = await contentService.getAll(userId, query);

    res.json({
      success: true,
      data: result
    });
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const content = await contentService.getById(userId, id);

    res.json({
      success: true,
      data: content
    });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const validatedData = updateContentSchema.parse(req.body);

    const content = await contentService.update(userId, id, validatedData);

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await contentService.delete(userId, id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  }),

  uploadFile: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const file = req.file;
    const { type, title, description, tags } = req.body;

    if (!file) {
      throw new Error('No file uploaded');
    }

    const content = await contentService.createFromFile(userId, file, {
      type,
      title,
      description,
      tags: tags ? JSON.parse(tags) : []
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: content
    });
  })
};
