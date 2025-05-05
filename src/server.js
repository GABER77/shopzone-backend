import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Errors in sync code
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception, Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
import app from './app.js';

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Errors like 'failed to connect to DB'
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
