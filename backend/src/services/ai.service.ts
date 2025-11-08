import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const aiService = {
  async enhanceContent(data: {
    type: string;
    title: string;
    description?: string;
    url?: string;
    contentText?: string;
  }) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Analyze this content and provide:
1. Category (one of: work, personal, learning, entertainment, shopping, health, finance, travel, food, other)
2. 3-5 relevant tags
3. Key metadata (entities, sentiment, topics)

Content:
Title: ${data.title}
Description: ${data.description || 'N/A'}
Type: ${data.type}
${data.url ? `URL: ${data.url}` : ''}
${data.contentText ? `Text: ${data.contentText.substring(0, 500)}` : ''}

Respond in JSON format:
{
  "category": "string",
  "suggestedTags": ["tag1", "tag2"],
  "metadata": {
    "entities": ["entity1", "entity2"],
    "sentiment": "positive|negative|neutral",
    "topics": ["topic1", "topic2"]
  }
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || 'other',
          suggestedTags: parsed.suggestedTags || [],
          metadata: parsed.metadata || {}
        };
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }

    return {
      category: 'other',
      suggestedTags: [],
      metadata: {}
    };
  },

  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return null;
    }
  },

  async semanticSearch(userId: string, query: string, limit: number = 20) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      if (!queryEmbedding) {
        // Fallback to text search
        return this.fallbackSearch(userId, query, limit);
      }

      // Note: This is a simplified version. In production, you'd use pgvector
      // For now, we'll use Gemini to understand the query and search
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Get user's content
      const userContent = await prisma.content.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          description: true,
          contentText: true,
          type: true,
          tags: true,
          metadata: true
        }
      });

      // Use AI to rank results
      const prompt = `Given this search query: "${query}"

Rank these content items by relevance (return IDs in order):
${userContent.map(c => `ID: ${c.id}, Title: ${c.title}, Description: ${c.description || 'N/A'}, Tags: ${c.tags.join(', ')}`).join('\n')}

Return only a JSON array of IDs in order of relevance, like: ["id1", "id2", "id3"]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON array
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const rankedIds = JSON.parse(jsonMatch[0]);
        
        // Return content in ranked order
        const rankedContent = rankedIds
          .slice(0, limit)
          .map((id: string) => userContent.find(c => c.id === id))
          .filter(Boolean);

        return rankedContent;
      }
    } catch (error) {
      console.error('Semantic search failed:', error);
    }

    return this.fallbackSearch(userId, query, limit);
  },

  async fallbackSearch(userId: string, query: string, limit: number) {
    return prisma.content.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { contentText: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ]
      },
      take: limit,
      orderBy: { accessedAt: 'desc' }
    });
  },

  async summarizeContent(contentText: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Summarize this content in 2-3 sentences:

${contentText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Summarization failed:', error);
      return '';
    }
  },

  async extractEntities(text: string) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Extract key entities from this text (people, places, organizations, products, concepts):

${text}

Return as JSON: {"people": [], "places": [], "organizations": [], "products": [], "concepts": []}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();

      const jsonMatch = text_response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Entity extraction failed:', error);
    }

    return { people: [], places: [], organizations: [], products: [], concepts: [] };
  }
};
