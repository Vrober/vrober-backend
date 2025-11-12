import mongoose from 'mongoose';

const callbackRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredTime: { type: String },
    note: { type: String },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

const CallbackRequest = mongoose.model('CallbackRequest', callbackRequestSchema);

export default CallbackRequest;
