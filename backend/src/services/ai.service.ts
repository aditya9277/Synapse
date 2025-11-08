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
2. Detected content type (one of: URL, ARTICLE, PRODUCT, VIDEO, IMAGE, NOTE, TODO, CODE, PDF, SCREENSHOT, HANDWRITTEN, AUDIO, BOOKMARK)
3. 3-5 relevant tags
4. Key metadata (entities, sentiment, topics)

Content:
Title: ${data.title}
Description: ${data.description || 'N/A'}
Type (as provided): ${data.type}
${data.url ? `URL: ${data.url}` : ''}
${data.contentText ? `Text: ${data.contentText.substring(0, 500)}` : ''}

Respond in JSON format:
{
  "category": "string",
  "detectedType": "string",
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
          detectedType: parsed.detectedType || undefined,
          suggestedTags: parsed.suggestedTags || [],
          metadata: parsed.metadata || {}
        } as any;
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }

    return {
      category: 'other',
      detectedType: undefined,
      suggestedTags: [],
      metadata: {}
    } as any;
  },

  // Generate embedding using gemini-2.5-flash (free model)
  // Creates a semantic vector by extracting key concepts and themes
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Extract semantic concepts that we can hash into a vector
      const prompt = `Extract the 20 most important semantic concepts/keywords from this text. Return ONLY a JSON array of strings.

Text: "${text.substring(0, 2000)}"

Example output: ["technology", "programming", "javascript", "web development", ...]
Return ONLY the JSON array, no other text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      // Clean up response - remove markdown code blocks if present
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Extract array from response
      const arrayMatch = responseText.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        const concepts = JSON.parse(arrayMatch[0]);
        if (Array.isArray(concepts) && concepts.length > 0) {
          // Convert concepts to a 768-dimensional vector using consistent hashing
          return this.conceptsToVector(concepts, text);
        }
      }

      console.warn('Failed to extract concepts from AI, using simple embedding');
      return this.generateSimpleEmbedding(text);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return this.generateSimpleEmbedding(text);
    }
  },

  // Convert concepts and text to a 768-dimensional vector
  conceptsToVector(concepts: string[], text: string): number[] {
    const vector = new Array(768).fill(0);
    const normalizedText = text.toLowerCase();

    // Use concepts to populate vector dimensions
    concepts.forEach((concept) => {
      const conceptLower = concept.toLowerCase();
      const hash = this.simpleHash(conceptLower);
      
      // Distribute concept influence across multiple dimensions
      for (let i = 0; i < 20; i++) {
        const dimIdx = (hash + i * 37) % 768;
        const weight = 1.0 / (i + 1); // Decay weight for spread
        vector[dimIdx] += weight * (normalizedText.includes(conceptLower) ? 1 : 0.5);
      }
    });

    // Add text features to remaining dimensions
    const words = normalizedText.split(/\s+/).filter(w => w.length > 3);
    words.slice(0, 100).forEach((word, idx) => {
      const hash = this.simpleHash(word);
      const dimIdx = (hash + idx) % 768;
      vector[dimIdx] += 0.3;
    });

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  },

  // Simple hash function for consistent dimension mapping
  simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  },

  // Simple fallback embedding generator using text hashing
  generateSimpleEmbedding(text: string): number[] {
    const embedding = new Array(768).fill(0);
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleanText.split(/\s+/).filter(w => w.length > 2);
    
    // Use word positions and character codes to create a vector
    words.forEach((word, idx) => {
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        const position = (charCode + idx + i) % 768;
        embedding[position] += (charCode / 255) * (1 / Math.sqrt(words.length));
      }
    });

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  },

  async semanticSearch(userId: string, query: string, limit: number = 20) {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      if (!queryEmbedding) {
        console.warn('Could not generate embedding for query, falling back to text search');
        return this.fallbackSearch(userId, query, limit);
      }

      // Use pgvector for cosine similarity search
      // Raw SQL query because Prisma doesn't support vector operations directly
      const embeddingStr = `[${queryEmbedding.join(',')}]`;
      
      const results = await prisma.$queryRaw<Array<{
        id: string;
        title: string;
        description: string | null;
        content_text: string | null;
        type: string;
        tags: string[];
        metadata: any;
        created_at: Date;
        updated_at: Date;
        accessed_at: Date | null;
        url: string | null;
        thumbnail_url: string | null;
        category: string | null;
        similarity: number;
      }>>`
        SELECT 
          id, title, description, content_text, type, tags, metadata,
          created_at, updated_at, accessed_at, url, thumbnail_url, category,
          1 - (embedding <=> ${embeddingStr}::vector) as similarity
        FROM contents
        WHERE user_id = ${userId}
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${embeddingStr}::vector
        LIMIT ${limit}
      `;

      // Transform to match expected format
      return results.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        contentText: r.content_text,
        type: r.type,
        tags: r.tags,
        metadata: r.metadata,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
        accessedAt: r.accessed_at?.toISOString() || null,
        url: r.url,
        thumbnailUrl: r.thumbnail_url,
        category: r.category
      }));
    } catch (error) {
      console.error('Semantic search with pgvector failed:', error);
      return this.fallbackSearch(userId, query, limit);
    }
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
      select: {
        id: true,
        title: true,
        description: true,
        contentText: true,
        type: true,
        tags: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        accessedAt: true,
        url: true,
        thumbnailUrl: true,
        category: true
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
