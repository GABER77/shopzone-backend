const getMe = (req, res, next) => {
  // req.user is added by protect middleware after verifying JWT
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
};

const userController = { getMe };

export default userController;
