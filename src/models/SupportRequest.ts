import mongoose, { Schema, Document } from 'mongoose'

export interface ISupportRequest extends Document {
  email: string
  message: string
  status: 'pending' | 'resolved'
  createdAt: Date
}

const SupportRequestSchema: Schema = new Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.SupportRequest || mongoose.model<ISupportRequest>('SupportRequest', SupportRequestSchema)
