import {
  AIMessage,
  HumanMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { createHash } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { agentGraph } from '../graph/graph.js';
import type { AgentAttachment, AgentRoute } from '../graph/state.js';

const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const allowedAttachmentTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

function isAgentAttachment(value: unknown): value is AgentAttachment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const attachment = value as Record<string, unknown>;
  if (
    typeof attachment.name !== 'string' ||
    attachment.name.length < 1 ||
    attachment.name.length > 255 ||
    typeof attachment.mimeType !== 'string' ||
    !allowedAttachmentTypes.has(attachment.mimeType) ||
    typeof attachment.data !== 'string' ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      attachment.data,
    )
  ) {
    return false;
  }

  const byteLength = Buffer.from(attachment.data, 'base64').length;
  return (
    byteLength > 0 &&
    byteLength <= MAX_ATTACHMENT_BYTES &&
    Buffer.from(attachment.data, 'base64').toString('base64') === attachment.data
  );
}

function isConversationTurn(value: unknown): value is ConversationTurn {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const turn = value as Record<string, unknown>;
  return (
    (turn.role === 'user' || turn.role === 'assistant') &&
    typeof turn.content === 'string' &&
    turn.content.trim().length > 0
  );
}

function getResponseText(message: BaseMessage): string {
  if (typeof message.content === 'string') {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if (
          typeof part === 'object' &&
          part !== null &&
          'text' in part &&
          typeof part.text === 'string'
        ) {
          return part.text;
        }
        return '';
      })
      .join('');
  }
  return '';
}

export async function invokeAgent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const { message, history, attachment } = body;

    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ message: 'A non-empty message is required.' });
      return;
    }

    const userId = req.get('x-user-id');
    if (!userId) {
      res.status(401).json({ message: 'Authenticated user ID is required.' });
      return;
    }

    if (
      history !== undefined &&
      (!Array.isArray(history) ||
        history.length > 50 ||
        !history.every(isConversationTurn))
    ) {
      res.status(400).json({
        message: 'History must contain at most 50 user or assistant messages with content.',
      });
      return;
    }

    if (attachment !== undefined && !isAgentAttachment(attachment)) {
      res.status(400).json({
        message: 'Attachment must be a PDF, JPEG, PNG, or WebP file no larger than 6 MB.',
      });
      return;
    }

    let documentNamespace: string | null = null;
    if (
      attachment &&
      typeof attachment === 'object' &&
      'mimeType' in attachment &&
      attachment.mimeType === 'application/pdf'
    ) {
      const pdfHash = createHash('sha256')
        .update(Buffer.from(attachment.data, 'base64'))
        .digest('hex');
      documentNamespace = createHash('sha256')
        .update(userId)
        .update(':')
        .update(pdfHash)
        .digest('hex');
    }

    const historyMessages = (history ?? []) as ConversationTurn[];
    const messages: BaseMessage[] = historyMessages.map((turn) =>
      turn.role === 'user'
        ? new HumanMessage(turn.content)
        : new AIMessage(turn.content),
    );
    messages.push(new HumanMessage(message.trim()));

    const result = await agentGraph.invoke({
      messages,
      userId,
      attachment: attachment ?? null,
      documentNamespace,
    });
    const response = result.messages.at(-1);
    if (!response) {
      throw new Error('Agent graph completed without producing a response');
    }

    res.status(200).json({
      route: result.route as AgentRoute,
      response: getResponseText(response),
      artifact: result.artifact,
    });
  } catch (error) {
    next(error);
  }
}
