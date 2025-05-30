import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import checkoutRouter from './routes/checkoutRoutes.js';
import checkoutController from './controllers/checkoutController.js';
import globalErrorHandler from './utils/globalErrorHandler.js';

const app = express();

// >>>>>>>>>>>>>>>>>>>>>>>>> GLOBAL MIDDLEWARE >>>>>>>>>>>>>>>>>>>>>>>>>

// Allow requests from other domains (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: 'http://localhost:5173', //frontend URL
    credentials: true, // enable cookies & credentials
  }),
);

//Logging incoming requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Stripe webhook route must come BEFORE bodyParser.json() or express.json()
// because Stripe needs raw body to verify signature
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  checkoutController.webhookCheckout,
);

// Parse nested query strings (e.g., price[lt]=200) into objects
app.set('query parser', 'extended');

// Body parser, Reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Reading data from the cookies (req.cookies)
app.use(cookieParser());

// >>>>>>>>>>>>>>>>>>>>>>>>> ROUTES >>>>>>>>>>>>>>>>>>>>>>>>>

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/checkout', checkoutRouter);

app.use(globalErrorHandler);

export default app;
