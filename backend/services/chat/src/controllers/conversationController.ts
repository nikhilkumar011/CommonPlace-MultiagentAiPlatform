import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';

export async function getConversations(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversations = await Conversation.find({
      userId: res.locals.userId as string,
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
}

export async function createConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { title } = req.body as Record<string, unknown>;
    if (typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'A non-empty title is required.' });
      return;
    }

    const conversation = await Conversation.create({
      userId: res.locals.userId as string,
      title: title.trim(),
    });

    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
}

export async function getConversation(
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

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: res.locals.userId as string,
    });
    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    res.status(200).json({ conversation });
  } catch (error) {
    next(error);
  }
}
