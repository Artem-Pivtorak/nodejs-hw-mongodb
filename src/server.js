import express from 'express';
import cors from 'cors';
import pino from 'pino';
import contactsRouter from './routes/contacts.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/auth.js';
import authenticate from './middlewares/authenticate.js';
import cookieParser from 'cookie-parser';
import apiDocsRouter from './routes/apiDocs.js';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerJsonPath = path.join(__dirname, '../docs/swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf-8'));

const logger = pino();

export const setupServer = () => {
  const app = express();

  app.use('/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      swaggerOptions: { docExpansion: 'none' }
    })
  );


app.get('/', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});


  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/auth', authRouter);

  app.use('/contacts', authenticate, contactsRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.use('/api-docs', apiDocsRouter);


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    logger.info(`Swagger UI доступний за http://localhost:${PORT}/api-docs`);
  });
};


