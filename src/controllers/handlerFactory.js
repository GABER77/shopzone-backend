import { v2 as cloudinary } from 'cloudinary';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import APIFeatures from '../utils/apiFeatures.js';

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

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Build the base query without pagination
    const baseQuery = new APIFeatures(Model.find(filter), req.query).filter();

    // Get total count of matching docs BEFORE pagination
    const totalResults = await baseQuery.query.countDocuments();

    // Now apply sorting, field limiting, pagination
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: totalResults, // <-- total matching products count (not just current page length)
      data: docs,
    });
  });

const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
      throw new CustomError('No document found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Find the product by ID
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      throw new CustomError('No document found with that ID', 404);
    }

    // 2. Delete images folder from Cloudinary using the stored folder path
    if (doc.cloudinaryFolder) {
      await cloudinary.api.delete_resources_by_prefix(doc.cloudinaryFolder);
      await cloudinary.api.delete_folder(doc.cloudinaryFolder);
    }

    // 3. Delete the document from the database
    await doc.deleteOne();

    res.status(204).json({
      status: 'success',
      message: null,
    });
  });

const handlerFactory = {
  createOne,
  getAll,
  deleteOne,
  getOne,
};
export default handlerFactory;
