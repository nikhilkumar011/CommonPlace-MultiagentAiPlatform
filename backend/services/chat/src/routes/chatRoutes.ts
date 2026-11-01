import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getConversation,
} from '../controllers/conversationController.js';
import { getMessages, saveMessage } from '../controllers/messageController.js';
import { requireUserId } from '../middleware/requireUserId.js';

const chatRoutes = Router();

chatRoutes.use(requireUserId);
chatRoutes.get('/conversations', getConversations);
chatRoutes.post('/conversations', createConversation);
chatRoutes.get('/conversations/:conversationId', getConversation);
chatRoutes.post('/conversations/:conversationId/messages', saveMessage);
chatRoutes.get('/conversations/:conversationId/messages', getMessages);

export default chatRoutes;
