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
  // Check if at least one image is uploaded
  if (!req.files || !req.files.images || req.files.images.length === 0)
    throw new CustomError('Please upload at least one image.', 400);

  // Attach the current user's ID as the seller
  req.body.seller = req.user._id;

  // Prevent users from setting createdAt manually
  if ('createdAt' in req.body) delete req.body.createdAt;

  // Generate a unique Cloudinary folder for the product
  const productFolder = `products/${uuidv4()}`;
  req.body.cloudinaryFolder = productFolder;

  // Step 1: Create product (validates fields via schema)
  const newProduct = await Product.create(req.body);

  // Step 2: Upload images in parallel but keep track of their original order
  const uploadResults = await Promise.all(
    req.files.images.map(async (file, index) => {
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
              public_id: `${index + 1}`,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(error);
              // Attach original index for later sorting
              resolve({ index, url: result.secure_url });
            },
          );

          // Convert buffer into a readable stream and pipe it to Cloudinary
          streamifier.createReadStream(processedImageBuffer).pipe(uploadStream);
        });
      // Await the upload and return the indexed result
      return await streamUpload();
    }),
  );

  // Sort results by original file index to maintain upload order
  uploadResults.sort((a, b) => a.index - b.index);

  // Extract just the secure URLs in the correct order
  req.body.images = uploadResults.map((item) => item.url);

  // Step 3: Attach the image URLs to the product and save
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
