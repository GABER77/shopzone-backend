import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import handlerFactory from './handlerFactory.js';
import Product from '../models/productModel.js';

const createProduct = handlerFactory.createOne(Product);
const getAllProducts = catchAsync(async (req, res, next) => {});
const getProduct = catchAsync(async (req, res, next) => {});
const updateProduct = catchAsync(async (req, res, next) => {});
const deleteProduct = catchAsync(async (req, res, next) => {});

const productController = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};

export default productController;
