import { Response, NextFunction } from 'express';
import { AiService, ChatRequest } from '../services/ai.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class ChatController {
  /**
   * Primary AI Concierge Chat Endpoint
   * Supports both Typed SSE Streaming and Standard JSON REST
   * POST /api/v1/chat
   */
  static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        message,
        countryCode,
        currencyCode,
        currencySymbol,
        conversionRate,
        sessionId,
        conversationHistory,
        liveCatalog,
        isAuthenticated: bodyAuth,
        userId: bodyUserId,
        guestSessionId,
        stream,
      } = req.body;

      const isStreamRequested = Boolean(
        stream === true ||
        req.query.stream === 'true' ||
        req.path.includes('/stream') ||
        (req.headers.accept && req.headers.accept.includes('text/event-stream'))
      );

      const user = req.user;
      const isAuthenticated = Boolean(user || bodyAuth);
      const userId = user?.id || bodyUserId;
      const effectiveSessionId = sessionId || guestSessionId || `session_${Date.now()}`;

      const clientIp =
        (req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        'ip_unknown';

      const chatParams: ChatRequest = {
        message,
        countryCode,
        currencyCode,
        currencySymbol,
        conversionRate,
        sessionId: effectiveSessionId,
        conversationHistory,
        liveCatalog,
        isAuthenticated,
        userId,
        guestSessionId: guestSessionId || effectiveSessionId,
        userEmail: user?.email,
        ip: clientIp,
        stream: isStreamRequested,
      };

      // TYPED SSE STREAMING RESPONSE
      if (isStreamRequested) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        });
        res.flushHeaders?.();

        const sendEvent = (event: string, data: any) => {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        try {
          await AiService.streamChat(chatParams, sendEvent);
          sendEvent('done', { status: 'complete', sessionId: effectiveSessionId });
          res.end();
          return;
        } catch (streamErr: any) {
          sendEvent('error', { message: streamErr?.message || 'Streaming interrupted' });
          res.end();
          return;
        }
      }

      // STANDARD REST JSON RESPONSE
      const result = await AiService.chat(chatParams);

      ApiResponse.success(
        res,
        {
          ...result,
          sessionId: effectiveSessionId,
          timestamp: result.timestamp || new Date().toISOString(),
        },
        'Response from SISODIA ATELIER ✧ AI Concierge.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean REST Response Endpoint (Backward-compatible)
   * POST /api/v1/chat/craftsman
   */
  static async askCraftsman(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    return ChatController.chat(req, res, next);
  }

  /**
   * Typed SSE Stream Route
   * POST /api/v1/chat/stream
   */
  static async streamChat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    req.body.stream = true;
    return ChatController.chat(req, res, next);
  }
}
