import mongoose, { Schema, Document } from 'mongoose'

export interface IDailyMetric extends Document {
  userId: string;
  date: string;
  hydration: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyMetricSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    hydration: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Ensure uniqueness per user per date
DailyMetricSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.models.DailyMetric || mongoose.model<IDailyMetric>('DailyMetric', DailyMetricSchema)
