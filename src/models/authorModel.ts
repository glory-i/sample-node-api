import mongoose, { Schema, Document } from 'mongoose';

export interface Author extends Document {
  name: string;
  nationality: string;
}

const authorSchema = new Schema({
  name: { type: String, required: true , index:true},
  nationality: String
});

export default mongoose.model<Author>('Author', authorSchema);
