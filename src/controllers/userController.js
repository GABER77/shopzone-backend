import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import User from '../models/userModel.js';
import handlerFactory from './handlerFactory.js';
import upload from '../middleware/multer.js';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import filterObject from '../utils/filterObject.js';

const uploadImageToBuffer = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const processedImageBuffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

  const userFolder = `users/${req.user.id}`;
  const imageName = `user-${req.user.id}-${Date.now()}`;

  const streamUpload = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: userFolder,
          public_id: imageName,
          resource_type: 'image',
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(processedImageBuffer).pipe(stream);
    });

  req.body.photo = await streamUpload();
  req.body.cloudinaryFolder = userFolder;
  next();
});

const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user post a password data
  if (req.body.password || req.body.passwordConfirm) {
    throw new CustomError(
      'This route is not for password update, Please use / update-password',
      400,
    );
  }

  // 2) Filtered out unwanted fields name that is not allowed to be updated
  const filteredBody = filterObject(req.body, 'name', 'email');
  if (req.body.photo) filteredBody.photo = req.body.photo;

  // 3) Update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});

const getMe = (req, res, next) => {
  // req.user is added by protect middleware after verifying JWT
  req.params.id = req.user.id;
  next();
};

const getUser = handlerFactory.getOne(User);

const userController = {
  getMe,
  getUser,
  uploadImageToBuffer,
  resizeUserPhoto,
  updateMe,
};

export default userController;
