import { Router } from 'express';
import { signIn, signUp } from '../controllers/userController';


const router = Router();

router.post('/authentication/signUp', signUp);
router.post('/authentication/signIn', signIn);


export default router;
