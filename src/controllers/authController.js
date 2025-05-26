import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import User from '../models/userModel.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined; // Don't include the hashed password in the response

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ), // Remove the cookie from the browser after this time
    httpOnly: true,
    sameSite: 'Lax', // Limits cookie to same-site requests for CSRF protection
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; // Only send cookie over HTTPS in production
  }

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    user,
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError('Please enter your email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    throw new CustomError('Incorrect email or password', 401);
  }

  createSendToken(user, 200, res);
});

const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new CustomError('Please login to get access', 401);
  }

  // 2) Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists: Maybe he deleted his account
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new CustomError('This user is no longer exists', 401);
  }

  // 4) Check if user changed his password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new CustomError(
      'User recently changed password, Please login again',
      401,
    );
  }
  req.user = currentUser;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new CustomError(
        'You do not have permission to perform this action.',
        403,
      );
    }
    next();
  };

const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  // 1) Check if the user give me all the require input
  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    throw new CustomError(
      'Please provide oldPassword, newPassword, and newPasswordConfirm.',
      400,
    );
  }

  // 2) Find user and include password
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // 3) Check if the old password is correct
  if (!(await user.checkPassword(req.body.oldPassword, user.password))) {
    throw new CustomError('Old password is not correct', 401);
  }

  // 4) Prevent reuse of current password
  const isSamePassword = await user.checkPassword(newPassword, user.password);
  if (isSamePassword) {
    throw new CustomError(
      'New password must be different from the old one.',
      400,
    );
  }

  // 5) Update the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save(); // Triggers .pre('save') hooks for hashing and passwordChangedAt

  // 6) Login user, send JWT
  createSendToken(user, 200, res);
});

const authController = {
  signUp,
  login,
  protect,
  restrictTo,
  logout,
  updatePassword,
};

export default authController;
