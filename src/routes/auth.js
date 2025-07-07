import express from 'express';
import validateBody from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { register, login, refresh, logout } from '../controllers/auth.js';
import { sendResetEmail } from '../controllers/auth.js';
import { resetPassword } from '../controllers/auth.js';
import { emailSchema } from '../schemas/emailSchema.js';
import { resetPwdSchema } from '../schemas/resetPwdSchema.js';


const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login',    validateBody(loginSchema),    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.post('/send-reset-email', validateBody(emailSchema), sendResetEmail);
router.post('/reset-pwd', validateBody(resetPwdSchema), resetPassword);

export default router;
