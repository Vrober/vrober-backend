import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6, 
    },

    address: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    dob: {
      type: Date, // optional
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    liveLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    ref: {
      type: String,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    voucher: [
      {
        code: String,
        discount: Number,
        expiry: Date,
      },
    ],
    profileImg: {
      type: String, // store image URL or path
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      required: true,
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
