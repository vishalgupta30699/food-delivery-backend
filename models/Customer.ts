import mongoose, { Schema, Document } from "mongoose";
import { OrderDoc } from "./Order";

interface customerDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lng: number;
  orders: [OrderDoc];
  cart: [any];
}

const CustomerSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    otp_expiry: {
      type: Date,
      required: true,
    },
    lat: { type: Number },
    lng: { type: Number },
    orders: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "order",
      },
    ],
    cart: [
      {
        food: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "food",
          required: true,
        },
        unit: { type: Number, required: true },
      },
    ],
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.password;
        delete ret.salt;
      },
    },
    timestamps: true,
  }
);

const Customer = mongoose.model<customerDoc>("customer", CustomerSchema);

export { Customer };
