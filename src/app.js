import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

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

app.get('/', (req, res) => {
  res.send('API Working');
});

export default app;
