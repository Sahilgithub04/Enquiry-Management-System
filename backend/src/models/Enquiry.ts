import mongoose, { Schema, Document } from 'mongoose';

export enum EnquiryStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

export interface IEnquiry extends Document {
  _id: mongoose.Types.ObjectId;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  assignedTo?: mongoose.Types.ObjectId | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema: Schema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(EnquiryStatus),
      default: EnquiryStatus.NEW,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
