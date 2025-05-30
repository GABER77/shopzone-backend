import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true },
      size: { type: Number, required: true },
      price: { type: Number, required: true }, // store price at time of order
    },
  ],
  amount: {
    type: Number, // total amount paid in cents
    required: true,
  },
  paymentIntentId: {
    type: String, // Stripe payment intent ID
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  shippingDetails: {
    name: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.populate('user') // populates the user document
    .populate('products.product', 'name'); // populates only the 'name' field of the product

  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
