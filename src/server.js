import express from 'express';
import cors from 'cors';
import pino from 'pino';
import contactsRouter from './routes/contacts.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/auth.js';
import authenticate from './middlewares/authenticate.js';



const logger = pino();

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/auth', authRouter);

  app.use('/contacts', authenticate, contactsRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

