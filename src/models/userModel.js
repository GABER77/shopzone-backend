import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      validate: [validator.isEmail, 'Please enter a valid email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default:
        'https://res.cloudinary.com/dj4ekmhwa/image/upload/v1748196386/defaultUser.jpg',
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password in queries
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on `create` and `save`, not on update
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'seller', 'admin'],
        message: 'Role is either: user, seller, admin',
      },
      default: 'user',
    },
    cart: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          size: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
          },
        },
      ],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
      immutable: true,
    },
    cloudinaryFolder: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
  },
  { minimize: false }, // This tells Mongoose: keep empty objects
);

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Set passwordChangedAt when the user changes his password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method: available in all document in a certain collection
userSchema.methods.checkPassword = async function (
  givenPassword,
  storedPassword,
) {
  return await bcrypt.compare(givenPassword, storedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTIssuedAt < changedTimeStamp;
  }
  // False means password not changed.
  return false;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
