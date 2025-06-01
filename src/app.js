import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';

import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import checkoutRouter from './routes/checkoutRoutes.js';
import ordersRouter from './routes/ordersRoutes.js';
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

// Set secure HTTP headers
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimit({
  limit: 500,
  windowMs: 60 * 60 * 1000, // Maximum of 500 request in 1 hour
  message: 'Too many requests from this IP, please try again after an hour',
});
app.use('/api', limiter);

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

// Data sanitization against NoSQL query injection
// Currently not compatible with Express 5 – waiting for an update to express-mongo-sanitize
// >>>>> app.use(mongoSanitize());

// Data sanitization against XSS(Cross-Site Scripting) attacks
// Same as express-mongo-sanitize
// >>>>> app.use(xss());

// Reading data from the cookies (req.cookies)
app.use(cookieParser());

// Enable compression to speed up response delivery
app.use(compression());

// >>>>>>>>>>>>>>>>>>>>>>>>> ROUTES >>>>>>>>>>>>>>>>>>>>>>>>>

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/api/v1/orders', ordersRouter);

app.use(globalErrorHandler);

export default app;
