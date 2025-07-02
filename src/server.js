import express from 'express';
import cors from 'cors';
import pino from 'pino';
import contactsRouter from './routes/contacts.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/auth.js';
import authenticate from './middlewares/authenticate.js';
import cookieParser from 'cookie-parser';





const logger = pino();

export const setupServer = () => {
  const app = express();


  app.get('/', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));


  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/auth', authRouter);

  app.use('/contacts', authenticate, contactsRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};


