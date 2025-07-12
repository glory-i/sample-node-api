import mongoose, { Schema, Document } from 'mongoose';


const logSchema = new Schema({
  action: String,
  bookId: Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now }
});

const BookLog = mongoose.model('BookLog', logSchema);

export default BookLog;
