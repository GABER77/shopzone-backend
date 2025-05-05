import express from 'express';
import cors from 'cors';

const app = express();

// Allow requests from other domains (Cross-Origin Resource Sharing)
app.use(cors());

// Body parser, Reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/', (req, res) => {
  res.send('API Working');
});

export default app;
