import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { searchService } from '../services/search.service';
import { asyncHandler } from '../middleware/errorHandler';

export const searchController = {
  search: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await searchService.search(
      userId,
      q,
      parseInt(limit as string) || 20
    );

    res.json({
      success: true,
      data: results
    });
  }),

  getSuggestions: asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const suggestions = await searchService.getSuggestions(userId, q);

    res.json({
      success: true,
      data: suggestions
    });
  })
};
