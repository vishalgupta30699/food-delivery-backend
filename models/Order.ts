import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
  items: [any];
  totalAmount: number;
  paidThrough: string;
  orderDate: Date;
  paymentResponse: string;
  orderStatus: string;
}

const OrderSchema = new Schema(
  {
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paidThrough: {
      type: String,
    },
    orderDate: {
      type: Date,
    },
    PaymentResponse: {
      type: String,
    },
    orderStatus: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
