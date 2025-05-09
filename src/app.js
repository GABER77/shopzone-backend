import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import userRouter from './routes/userRoutes.js';

const app = express();

// >>>>>>>>>>>>>>>>>>>>>>>>> GLOBAL MIDDLEWARE >>>>>>>>>>>>>>>>>>>>>>>>>

// Allow requests from other domains (Cross-Origin Resource Sharing)
app.use(cors());

// Reading static files
app.use(express.static('public'));

//Logging incoming requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, Reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// >>>>>>>>>>>>>>>>>>>>>>>>> ROUTES >>>>>>>>>>>>>>>>>>>>>>>>>

app.use('/api/v1/users', userRouter);

export default app;
