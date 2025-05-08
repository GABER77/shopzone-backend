import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connected');
  } catch (err) {
    console.error('❌ Cloudinary connection failed, Shutting down...');
    console.error(err?.error?.message || 'Unknown error');
    process.exit(1);
  }
};

export default connectCloudinary;
