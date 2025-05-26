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
    // Build the base query without pagination
    const baseFeatures = new APIFeatures(Model.find(), req.query).filter();

    // Get total count of matching docs BEFORE pagination
    // To determine total number of pages in frontend
    const totalResults = await baseFeatures.query.clone().countDocuments();

    const docs = await baseFeatures.sort().limitFields().paginate().query;

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
      doc,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Check if the user provide data to update
    if (!req.body) {
      throw new CustomError(
        'Request body is empty. Please provide data to update.',
        400,
      );
    }

    //  Create error if user post a password data
    if (req.body.password || req.body.passwordConfirm) {
      throw new CustomError(
        'This route is not for password update, Please use / update-password',
        400,
      );
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the new updated document
      runValidators: true,
    });

    if (!doc) {
      throw new CustomError('No document found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Find the document by ID
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
  updateOne,
};
export default handlerFactory;
