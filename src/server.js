import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: '../config.env' });

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port: ${port}`));
