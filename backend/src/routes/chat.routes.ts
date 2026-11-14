import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { optionalAuthenticate } from '../middlewares/authenticate';
import { chatMessageSchema, streamChatSchema } from '../validators/chat.validator';

const router = Router();

/**
 * Primary AI Concierge Chat Endpoint
 * Supports both JSON REST and Typed SSE Streaming
 * POST /api/v1/chat
 */
router.post(
  '/',
  optionalAuthenticate,
  validateRequest({ body: chatMessageSchema }),
  ChatController.chat
);

/**
 * REST AI Concierge
 * POST /api/v1/chat/craftsman
 */
router.post(
  '/craftsman',
  optionalAuthenticate,
  validateRequest({ body: chatMessageSchema }),
  ChatController.askCraftsman
);

/**
 * Typed SSE Chat Stream Route
 * POST /api/v1/chat/stream
 */
router.post(
  '/stream',
  optionalAuthenticate,
  validateRequest({ body: streamChatSchema }),
  ChatController.streamChat
);

export default router;
