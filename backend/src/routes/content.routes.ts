import { Router } from 'express';
import { contentController } from '../controllers/content.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create new content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [URL, ARTICLE, PRODUCT, VIDEO, IMAGE, NOTE, TODO, CODE, PDF, SCREENSHOT, HANDWRITTEN, AUDIO, BOOKMARK]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               contentText:
 *                 type: string
 *               metadata:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: integer
 *               thumbnailUrl:
 *                 type: string
 *               source:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content created successfully
 */
router.post('/', contentController.create);

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content for authenticated user
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of content items
 */
router.get('/', contentController.getAll);

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content details
 *       404:
 *         description: Content not found
 */
router.get('/:id', contentController.getById);

/**
 * @swagger
 * /api/content/{id}:
 *   patch:
 *     summary: Update content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Content updated successfully
 */
router.patch('/:id', contentController.update);

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content deleted successfully
 */
router.delete('/:id', contentController.delete);

/**
 * @swagger
 * /api/content/upload:
 *   post:
 *     summary: Upload file content (images, screenshots, etc.)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post('/upload', upload.single('file'), contentController.uploadFile);

export default router;
