import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

// synchronous errors
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception, Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
import app from './app.js';

await connectDB();
await connectCloudinary();

const port = process.env.PORT || 8000;
const server = app.listen(port, () =>
  console.log(`App running on port ${port}`),
);

// asynchronous errors caused by a rejected Promise
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection, Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Responding to SIGTERM signal
process.on('SIGTERM', () => {
  console.log('✌ SIGTERM RECEIVED, Shutting down gracefully ');
  server.close(() => {
    console.log('💥 Process Terminated');
  });
});
