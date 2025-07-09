import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const tempDir = path.resolve('tmp');

// Переконайся, що tmp існує
await fs.mkdir(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage });
