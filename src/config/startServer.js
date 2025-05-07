import mongoose from 'mongoose';

const connectDB = async () => {
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
  );

  await mongoose.connect(DB);
  console.log('✅ DB Connected Successfully');
};

export default connectDB;
