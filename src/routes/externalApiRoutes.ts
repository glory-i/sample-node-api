import { Router } from 'express';
import { getJoke, postExample } from '../controllers/apiController';

const router = Router();

router.get('/joke', getJoke);
router.post('/post-example', postExample);

export default router;
