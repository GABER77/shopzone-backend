import express from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';

const userRouter = express.Router();

// Public Routes (No Authentication Required)
userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.post('/logout', authController.logout);

// Protect all routes that come after this middleware
userRouter.use(authController.protect);

userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch(
  '/update-me',
  userController.uploadImageToBuffer,
  userController.resizeUserPhoto,
  userController.updateMe,
);
userRouter.delete('/delete-me', userController.deleteMe);

export default userRouter;
