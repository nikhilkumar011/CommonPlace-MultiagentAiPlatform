import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const allowedAttachmentTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function isValidAttachment(value: unknown): boolean {
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

  const bytes = Buffer.from(attachment.data, 'base64');
  return (
    bytes.length > 0 &&
    bytes.length <= MAX_ATTACHMENT_BYTES &&
    bytes.toString('base64') === attachment.data
  );
}

export async function saveMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { conversationId } = req.params;
    const { content, role, attachment } = req.body as Record<string, unknown>;
    if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
      res.status(400).json({ message: 'A valid conversation ID is required.' });
      return;
    }
    if (typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ message: 'A non-empty message content is required.' });
      return;
    }
    if (role !== undefined && role !== 'user' && role !== 'assistant') {
      res.status(400).json({ message: 'Role must be user or assistant.' });
      return;
    }
    if (attachment !== undefined && !isValidAttachment(attachment)) {
      res.status(400).json({
        message: 'Attachment must be a PDF, JPEG, PNG, or WebP file no larger than 6 MB.',
      });
      return;
    }

    const userId = res.locals.userId as string;
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    const message = await Message.create({
      conversationId: conversation._id,
      userId,
      content: content.trim(),
      role: role ?? 'user',
      ...(attachment === undefined ? {} : { attachment }),
    });
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { conversationId } = req.params;
    if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
      res.status(400).json({ message: 'A valid conversation ID is required.' });
      return;
    }

    const conversation = await Conversation.exists({
      _id: conversationId,
      userId: res.locals.userId as string,
    });
    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1, _id: 1 })
      .lean();
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
}
