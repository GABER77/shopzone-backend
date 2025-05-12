import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
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

  // Create a unique product folder name based on the unique identifier
  const uniqueID = uuidv4();
  const productFolder = `products/${uniqueID}`;

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `${i + 1}`;
      const filePath = `./public/temp/${fileName}`; // Temporary file path

      await sharp(file.buffer)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(filePath);

      const result = await cloudinary.uploader.upload(filePath, {
        public_id: fileName,
        folder: productFolder,
        resource_type: 'image',
      });

      req.body.images.push(result.secure_url);

      // Delete the temporary file after uploading
      fs.unlinkSync(filePath);
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
