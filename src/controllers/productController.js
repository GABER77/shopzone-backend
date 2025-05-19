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

// Create product with delayed image upload
const createProductAndUploadImages = catchAsync(async (req, res, next) => {
  // Attach seller to the body
  req.body.seller = req.user._id;

  // Prevent users from setting createdAt manually
  if ('createdAt' in req.body) delete req.body.createdAt;

  // 2. Prepare Cloudinary folder
  const productFolder = `products/${uuidv4()}`;
  req.body.cloudinaryFolder = productFolder;

  // Step 1: Create product (validates fields via schema)
  const newProduct = await Product.create(req.body);

  // Initialize images array for URLs
  req.body.images = [];

  // Step 3: Process and upload each image
  await Promise.all(
    req.files.images.map(async (file, i) => {
      // 1. Use sharp to compress and resize the image
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

  newProduct.images = req.body.images;
  await newProduct.save();

  res.status(201).json({
    status: 'success',
    data: {
      data: newProduct,
    },
  });
});

const getAllProducts = handlerFactory.getAll(Product);
const getProduct = handlerFactory.getOne(Product);
const updateProduct = catchAsync(async (req, res, next) => {});
const deleteProduct = handlerFactory.deleteOne(Product);

const productController = {
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImagesToBuffer,
  createProductAndUploadImages,
};

export default productController;
