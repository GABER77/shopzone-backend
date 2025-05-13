import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
    min: [0, 'Price must be a positive number'],
  },
  images: {
    type: [String],
    validate: {
      validator: function (val) {
        return val.length > 0 && val[0].trim() !== '';
      },
      message: 'A product must have at least one image.',
    },
  },
  category: {
    type: String,
    required: [true, 'A product must have a category'],
    enum: {
      values: [
        "Men's Shoes",
        "Women's Shoes",
        'Basketball Shoes',
        'Running Shoes',
      ],
      message:
        "Category is either: Men's Shoes, Women's Shoes, Basketball Shoes, Running Shoes",
    },
    trim: true,
  },
  size: {
    type: [Number],
    validate: {
      validator: function (val) {
        return val.length > 0 && val.every((num) => typeof num === 'number');
      },
      message: 'A product must have at least one size.',
    },
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  cloudinaryFolder: {
    type: String,
    select: false,
    immutable: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
