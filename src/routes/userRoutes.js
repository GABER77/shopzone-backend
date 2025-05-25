import express from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.post('/logout', authController.logout);

userRouter.use(authController.protect);

userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch(
  '/update-me',
  userController.uploadImageToBuffer,
  userController.resizeUserPhoto,
  userController.updateMe,
);

export default userRouter;
