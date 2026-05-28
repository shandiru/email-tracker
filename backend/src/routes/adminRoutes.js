import express from 'express';
import { adminLogin, getAdminUsers } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/users', protectAdmin, getAdminUsers);

export default router;
