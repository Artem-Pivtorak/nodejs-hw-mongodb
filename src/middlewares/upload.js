import multer from 'multer';
import { storage } from '../services/cloudinary.js';

export const upload = multer({ storage });
