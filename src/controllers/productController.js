import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import handlerFactory from './handlerFactory.js';
import Product from '../models/productModel.js';
import upload from '../middleware/multer.js';

const uploadImagesToBuffer = upload.fields([{ name: 'images', maxCount: 3 }]);

const resizeAndCloudinaryUpload = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.images) return next();

  req.body.images = [];

  // Create a unique folder name for product in Cloudinary using unique identifier
  const uniqueID = uuidv4();
  const productFolder = `product/${uniqueID}`;
  req.body.cloudinaryFolder = productFolder; // Needed when deleting a product

  await Promise.all(
    req.files.images.map(async (file, i) => {
      // 1. Use sharp to compress and resize the image from memory
      const processedImageBuffer = await sharp(file.buffer)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      // 2. Upload the processed image buffer to Cloudinary using stream
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: productFolder,
              public_id: `${i + 1}`,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );

          // Convert buffer into a readable stream and pipe it to Cloudinary
          streamifier.createReadStream(processedImageBuffer).pipe(uploadStream);
        });

      const result = await streamUpload();

      req.body.images.push(result.secure_url);
    }),
  );

  next();
});

const createProduct = handlerFactory.createOne(Product);
const getAllProducts = catchAsync(async (req, res, next) => {});
const getProduct = catchAsync(async (req, res, next) => {});
const updateProduct = catchAsync(async (req, res, next) => {});
const deleteProduct = catchAsync(async (req, res, next) => {});

const productController = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImagesToBuffer,
  resizeAndCloudinaryUpload,
};

export default productController;
