import mongoose, { Schema, Document } from 'mongoose'

export interface ISportsLog extends Document {
  userId: string;
  date: string;
  name: string;
  durationHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const SportsLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    name: { type: String, required: true },
    durationHours: { type: Number, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.SportsLog || mongoose.model<ISportsLog>('SportsLog', SportsLogSchema)
