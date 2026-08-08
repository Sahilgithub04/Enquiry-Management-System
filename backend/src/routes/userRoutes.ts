import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

// All user management routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
