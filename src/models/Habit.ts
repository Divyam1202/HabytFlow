import mongoose, { Schema, Document } from 'mongoose'

export interface IHabit extends Document {
  userId: string;
  name: string;
  description?: string;
  category: string;
  color?: string;
  history: Map<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    color: { type: String, default: 'bg-emerald-500' },
    history: {
      type: Map,
      of: Boolean,
      default: new Map()
    }
  },
  { timestamps: true }
)

export default mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema)
