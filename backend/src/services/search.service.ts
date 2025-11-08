import { PrismaClient } from '@prisma/client';
import { aiService } from './ai.service';

const prisma = new PrismaClient();

export const searchService = {
  async search(userId: string, query: string, limit: number = 20) {
    // Use AI for semantic search
    const results = await aiService.semanticSearch(userId, query, limit);

    return {
      query,
      results,
      count: results.length
    };
  },

  async getSuggestions(userId: string, query: string) {
    // Get suggestions based on tags, titles, and categories
    const [tags, recentContent, categories] = await Promise.all([
      // Matching tags
      prisma.tag.findMany({
        where: {
          userId,
          name: { contains: query, mode: 'insensitive' }
        },
        take: 5,
        orderBy: { usageCount: 'desc' }
      }),
      // Recent matching content
      prisma.content.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, title: true, type: true },
        orderBy: { accessedAt: 'desc' }
      }),
      // Matching categories
      prisma.content.findMany({
        where: {
          userId,
          category: { contains: query, mode: 'insensitive' }
        },
        distinct: ['category'],
        select: { category: true },
        take: 3
      })
    ]);

    return {
      tags: tags.map(t => ({ type: 'tag', value: t.name, count: t.usageCount })),
      content: recentContent.map(c => ({ type: 'content', value: c.title, id: c.id, contentType: c.type })),
      categories: categories.map(c => ({ type: 'category', value: c.category }))
    };
  }
};
