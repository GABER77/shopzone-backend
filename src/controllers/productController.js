import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import handlerFactory from './handlerFactory.js';
import Product from '../models/productModel.js';
import upload from '../middleware/multer.js';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const uploadImagesToBuffer = upload.fields([{ name: 'images', maxCount: 3 }]);

const resizeAndPushImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.images) return next();

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      // Create a unique filename based on the unique identifier and index
      const uniqueID = uuidv4(); // Generates a unique identifier
      const fileName = `product-${uniqueID}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/${fileName}`);

      req.body.images.push(fileName);
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
  resizeAndPushImages,
};

export default productController;
