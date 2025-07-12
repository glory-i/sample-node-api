import mongoose, { Schema, Document } from 'mongoose';
import  BookLog  from './bookLogModel'



export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Book extends Document {
  title: string;
  author: string;
  year: number;
  reviews: Review[]; 
}


const reviewSchema = new Schema({
  user: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });


const bookSchema = new Schema({
  title: {type: String} ,
   author: {type: String, index:true} ,  //i can define index in-line like this
   //author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  year: Number,
  reviews: [reviewSchema],
  
}, { timestamps: true });


//creates a partial index on ONLY books where year is greater than 2000.
bookSchema.index(
  { title: 1 }, 
  { partialFilterExpression: { year: { $gte: 2000 } } }
)

//middlewares
bookSchema.pre('save', function (next) {
  console.log(` Saving book: ${this.title}`);
  next();
});

bookSchema.post('save', async function (doc) {
  await BookLog.create({ action: 'created or updated', bookId: doc._id });
  console.log(` Book ${doc.title} saved & logged.`);
});



export default mongoose.model<Book>('Book', bookSchema);

