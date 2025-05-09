import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newUser },
  });
});

const login = catchAsync(async (req, res, next) => {});

export { signUp, login };
