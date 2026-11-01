import { Router } from 'express';
import { getCurrentUser, login, logout, register } from '../controllers/authController.js';
import { requireAuth } from './authMiddleware.js';
const authRoutes = Router();
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', requireAuth, logout);
authRoutes.get('/me', requireAuth, getCurrentUser);
export default authRoutes;
//# sourceMappingURL=authRoutes.js.map