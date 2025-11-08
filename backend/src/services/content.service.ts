import { PrismaClient } from '@prisma/client';
import { CreateContentInput, UpdateContentInput, QueryContentInput } from '../schemas/content.schema';
import { AppError } from '../middleware/errorHandler';
import { aiService } from './ai.service';
import { ocrService } from './ocr.service';
import path from 'path';

const prisma = new PrismaClient();

export const contentService = {
  async create(userId: string, data: CreateContentInput) {
    // Use AI to enhance content
    let metadata = data.metadata || {};
    let tags = data.tags || [];
    let category = data.category;

    // Extract metadata and classify content using AI
    if (data.url || data.contentText) {
      const aiEnhancement = await aiService.enhanceContent({
        type: data.type,
        title: data.title,
        description: data.description,
        url: data.url,
        contentText: data.contentText
      });

      metadata = { ...metadata, ...aiEnhancement.metadata };
      tags = [...new Set([...tags, ...aiEnhancement.suggestedTags])];
      category = category || aiEnhancement.category;
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        description: data.description,
        url: data.url,
        contentText: data.contentText,
        metadata,
        tags,
        category,
        priority: data.priority || 0,
        thumbnailUrl: data.thumbnailUrl,
        source: data.source
      }
    });

    // Update tag usage counts
    for (const tagName of tags) {
      await prisma.tag.upsert({
        where: {
          userId_name: {
            userId,
            name: tagName
          }
        },
        create: {
          userId,
          name: tagName,
          usageCount: 1
        },
        update: {
          usageCount: { increment: 1 }
        }
      });
    }

    return content;
  },

  async getAll(userId: string, query: QueryContentInput) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.tags) {
      where.tags = { hasSome: query.tags.split(',') };
    }

    if (query.isFavorite) {
      where.isFavorite = query.isFavorite === 'true';
    }

    if (query.isArchived) {
      where.isArchived = query.isArchived === 'true';
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { contentText: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.content.count({ where });

    // Get content
    const content = await prisma.content.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
      }
    });

    return {
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getById(userId: string, id: string) {
    const content = await prisma.content.findFirst({
      where: { id, userId }
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    // Update access count and last accessed time
    await prisma.content.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        accessedAt: new Date()
      }
    });

    return content;
  },

  async update(userId: string, id: string, data: UpdateContentInput) {
    // Check if content exists and belongs to user
    const existing = await prisma.content.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError('Content not found', 404);
    }

    // Update content
    const content = await prisma.content.update({
      where: { id },
      data
    });

    // Update tag usage if tags changed
    if (data.tags) {
      const newTags = data.tags.filter(tag => !existing.tags.includes(tag));
      const removedTags = existing.tags.filter(tag => !data.tags!.includes(tag));

      for (const tagName of newTags) {
        await prisma.tag.upsert({
          where: { userId_name: { userId, name: tagName } },
          create: { userId, name: tagName, usageCount: 1 },
          update: { usageCount: { increment: 1 } }
        });
      }

      for (const tagName of removedTags) {
        await prisma.tag.updateMany({
          where: { userId, name: tagName },
          data: { usageCount: { decrement: 1 } }
        });
      }
    }

    return content;
  },

  async delete(userId: string, id: string) {
    // Check if content exists and belongs to user
    const existing = await prisma.content.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError('Content not found', 404);
    }

    // Delete content
    await prisma.content.delete({
      where: { id }
    });

    // Update tag usage counts
    for (const tagName of existing.tags) {
      await prisma.tag.updateMany({
        where: { userId, name: tagName },
        data: { usageCount: { decrement: 1 } }
      });
    }
  },

  async createFromFile(
    userId: string,
    file: Express.Multer.File,
    data: { type: string; title: string; description?: string; tags?: string[] }
  ) {
    let contentText = '';
    let metadata: any = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    };

    // Extract text from images using OCR
    if (file.mimetype.startsWith('image/')) {
      try {
        const ocrResult = await ocrService.extractText(file.path);
        contentText = ocrResult.text;
        metadata.ocrConfidence = ocrResult.confidence;
      } catch (error) {
        console.error('OCR failed:', error);
      }
    }

    // Create content
    return this.create(userId, {
      type: data.type as any,
      title: data.title || file.originalname,
      description: data.description,
      contentText,
      metadata,
      tags: data.tags,
      filePath: file.path,
      thumbnailUrl: file.mimetype.startsWith('image/') ? `/uploads/${file.filename}` : undefined
    });
  }
};
