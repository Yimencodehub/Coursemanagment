import express from 'express';
import { subscribe, getSubscribers, unsubscribe } from '../controllers/subscriberController.js';

const router = express.Router();

router.get('/',            getSubscribers);
router.post('/',           subscribe);
router.delete('/:email',   unsubscribe);

export default router;
