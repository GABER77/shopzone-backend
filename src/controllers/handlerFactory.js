import catchAsync from '../utils/catchAsync.js';

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Prevent users from setting the date manually, if it exists
    if ('createdAt' in req.body) {
      delete req.body.createdAt;
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

const handlerFactory = {
  createOne,
};
export default handlerFactory;
