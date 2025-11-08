import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const ocrService = {
  async extractText(imagePath: string): Promise<{ text: string; confidence: number }> {
    try {
      // Use Tesseract for initial OCR
      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: () => {} // Suppress logs
      });

      let text = result.data.text;
      const confidence = result.data.confidence;

      // If confidence is low, try Gemini Vision
      if (confidence < 70) {
        try {
          const geminiText = await this.extractTextWithGeminiVision(imagePath);
          if (geminiText && geminiText.length > text.length) {
            text = geminiText;
          }
        } catch (error) {
          console.error('Gemini Vision OCR failed:', error);
        }
      }

      return { text, confidence };
    } catch (error) {
      console.error('OCR failed:', error);
      throw error;
    }
  },

  async extractTextWithGeminiVision(imagePath: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      // Read image file
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        },
        'Extract all text from this image, including handwritten text. Return only the extracted text without any explanation.'
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Vision extraction failed:', error);
      return '';
    }
  },

  async analyzeImage(imagePath: string): Promise<{
    description: string;
    objects: string[];
    colors: string[];
    text: string;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        },
        `Analyze this image and provide:
1. A brief description (1-2 sentences)
2. Main objects/items visible
3. Dominant colors
4. Any text visible

Return as JSON:
{
  "description": "string",
  "objects": ["object1", "object2"],
  "colors": ["color1", "color2"],
  "text": "extracted text"
}`
      ]);

      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
    }

    return {
      description: '',
      objects: [],
      colors: [],
      text: ''
    };
  }
};
