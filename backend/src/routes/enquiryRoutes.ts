import { Router } from 'express';
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} from '../controllers/enquiryController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createEnquiry);
router.get('/', getEnquiries);
router.get('/:id', getEnquiryById);
router.put('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);

export default router;
