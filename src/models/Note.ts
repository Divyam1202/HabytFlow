import mongoose, { Schema, Document } from 'mongoose'

export interface INote extends Document {
  userId: string;
  date: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

NoteSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema)
