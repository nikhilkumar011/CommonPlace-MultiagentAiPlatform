import { Router } from 'express';
import { invokeAgent } from '../controllers/agentController.js';

const agentRoutes = Router();

agentRoutes.post('/invoke', invokeAgent);

export default agentRoutes;
