import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { AppError, asyncHandler } from '../middleware/errorHandler';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  }),

  login: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshAccessToken(validatedData.refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    await authService.logout(refreshToken);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
};
