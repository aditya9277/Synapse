import { PrismaClient } from '@prisma/client';
import { CreateContentInput, UpdateContentInput, QueryContentInput } from '../schemas/content.schema';
import { AppError } from '../middleware/errorHandler';
import { aiService } from './ai.service';
import { ocrService } from './ocr.service';

const prisma = new PrismaClient();

export const contentService = {
  async create(userId: string, data: CreateContentInput) {
    // Use AI to enhance content with tags, category, and metadata
    let metadata = data.metadata || {};
    let tags = data.tags || [];
    let category = data.category;

    // Build content text for embedding and AI enhancement
    const contentForAI = `${data.title}\n${data.description || ''}\n${data.contentText || ''}`.trim();

    // Generate embedding for semantic search
    let embeddingVector: number[] | null = null;
    if (contentForAI) {
      embeddingVector = await aiService.generateEmbedding(contentForAI);
    }

    // Extract metadata and classify content using AI
    if (data.url || data.contentText || data.description) {
      const aiEnhancement = await aiService.enhanceContent({
        type: data.type,
        title: data.title,
        description: data.description,
        url: data.url,
        contentText: data.contentText
      });

      metadata = { ...metadata, ...aiEnhancement.metadata };
      // store detected type from AI into metadata so downstream logic can pick it up
      if (aiEnhancement.detectedType) {
        (metadata as any).detectedType = aiEnhancement.detectedType;
      }
      // Merge AI-suggested tags with user-provided tags
      tags = [...new Set([...tags, ...aiEnhancement.suggestedTags])];
      category = category || aiEnhancement.category;
      
      console.log(`AI Enhancement for "${data.title}": category=${category}, tags=[${tags.join(', ')}]`);
    }

    // Decide final content type: prefer explicit non-URL provided type, otherwise use AI-detected type when available
    let contentType = data.type;
    try {
      if (!contentType || contentType === 'URL') {
        // aiEnhancement may be undefined if AI step skipped
        // Use aiEnhancement.detectedType when available
        // We called aiService.enhanceContent above only when url/contentText/description exist
        // so try to reuse the variable via a best-effort lookup
        // Note: aiEnhancement was declared inside the if block earlier; reconstruct by calling enhanceContent if needed
        // but avoid calling twice — instead infer from metadata if present
        if ((metadata as any).detectedType) {
          contentType = (metadata as any).detectedType;
        }
        // If still not available, leave as provided (may be undefined)
      }
    } catch (err) {
      console.warn('Content type detection fallback failed', err);
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        userId,
        type: (contentType as any) || data.type,
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

    // Update embedding using raw SQL (Prisma doesn't support vector type directly)
    if (embeddingVector) {
      await prisma.$executeRaw`
        UPDATE contents 
        SET embedding = ${`[${embeddingVector.join(',')}]`}::vector
        WHERE id = ${content.id}
      `;
    }

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

    // Regenerate embedding if content text changed
    if (data.title || data.description || data.contentText) {
      const contentForAI = `${data.title || existing.title}\n${data.description || existing.description || ''}\n${data.contentText || existing.contentText || ''}`.trim();
      const embeddingVector = await aiService.generateEmbedding(contentForAI);
      
      if (embeddingVector) {
        await prisma.$executeRaw`
          UPDATE contents 
          SET embedding = ${`[${embeddingVector.join(',')}]`}::vector
          WHERE id = ${id}
        `;
      }
    }

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
      metadata: { ...metadata, filePath: file.path },
      tags: data.tags,
      thumbnailUrl: file.mimetype.startsWith('image/') ? `/uploads/${file.filename}` : undefined
    });
  }
};
