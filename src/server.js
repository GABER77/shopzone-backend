import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: '../config.env' });

// Errors in sync code
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception, Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port: ${port}`));
