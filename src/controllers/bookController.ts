import { Request, Response } from 'express';
import mongoose, { Schema, Document } from 'mongoose';


//import BookModel from '../models/bookModel';
import Book from '../models/bookModel';
import BookLog from '../models/bookLogModel';

export const createBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: 'Error creating book', error: err });
  }
};

// export const createBook = async (req: Request, res: Response) => {
//   const { title, author, year } = req.body;

//   try {
//     const newBook = await Book.create({ title, author, year });
//     res.status(201).json(newBook);
//   } catch {
//     res.status(500).json({ error: 'Failed to create book' });
//   }
// };

// export const getBooks = async (_req: Request, res: Response) => {
//   try {
//     const books = await Book.find().populate('author');
//     res.json(books);
//   } catch {
//     res.status(500).json({ error: 'Failed to fetch books' });
//   }
// };


export const getBooks = async (_req: Request, res: Response) => {
  const books = await Book.find();
  res.json(books);
};

export const getBookById = async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);
  if (book == null)
  {
    res.status(404).json({ message: 'Book not found' });
  } 
  res.json(book);
};

export const updateBook = async (req: Request, res: Response) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!book){
     res.status(404).json({ message: 'Book not found' });
  } 
  res.json(book);
};

export const deleteBook = async (req: Request, res: Response) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    res.status(404).json({ message: 'Book not found' });
  } 
  res.json({ message: 'Book deleted' });
};


export const searchBooks = async (req: Request, res: Response) => {
  const { title, author, minYear, maxYear } = req.query;

  const filters: any = {};

  if (title) {
    filters.title = { $regex: title, $options: 'i' }; // case-insensitive match
  }

  if (author) {
    filters.author = { $regex: author, $options: 'i' };
  }

  if (minYear || maxYear) {
    filters.year = {};
    if (minYear) filters.year.$gte = parseInt(minYear as string);
    if (maxYear) filters.year.$lte = parseInt(maxYear as string);
  }

  try {
    const books = await Book.find(filters).sort({ year: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search books' });
  }
};


export const updateBookYear = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { year } = req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(id,
      { $set: { year } },
      { new: true }
    );
    if (!updatedBook)  res.status(404).json({ message: 'Not found' });

    res.json(updatedBook);
  } catch {
    res.status(500).json({ error: 'Failed to update year' });
  }
};


export const boostOldBooks = async (_req: Request, res: Response) => {
  try {
    const result = await Book.updateMany(
      { year: { $lt: 2000 } },
      { $inc: { year: 10 } }
    );
    res.json({ updatedCount: result.modifiedCount });
  } catch {
    res.status(500).json({ error: 'Failed to boost years' });
  }
};



export const addReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user, rating, comment } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book || book == null) {
        res.status(404).json({ message: 'Not found' })
    } 

    book?.reviews.push({ user, rating, comment });
    await book?.save();

    res.json(book?.reviews);
  } catch {
    res.status(500).json({ error: 'Error adding review' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book)  res.status(404).json({ message: 'Not found' });
    res.json(book?.reviews);
  } catch {
    res.status(500).json({ error: 'Error retrieving reviews' });
  }
};




//HOW TO IMPLEMENT TRANSACTIONS IN MONDO DB  (begin transactions commit etc.)
export const createBookWithTransaction = async (req: Request, res: Response) => {
  //define the session(tranaction and start it ... BEGIN TRAN)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, author, year } = req.body;

    //pass the session variable into all the functions you are carrying out .
    const newBook = await Book.create([{ title, author, year }], { session });

   
   //pass the session variable into all the functions you are carrying out .
    await BookLog.create([{ action: 'created', bookId: newBook[0]._id }], { session });

    //commit the session and end it.
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newBook[0]);

  } catch (error) {

    //terminate the session if errors.
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Transaction failed', detail: error });
  }
};


export const authorStats = async (_req: Request, res: Response) => {
  const stats = await Book.aggregate([
    { $unwind: "$reviews" }, // separate each review as its own document.
    {
      $group: {
        _id: "$author", // group by author
        totalBooks: { $sum: 1 },
        avgRating: { $avg: "$reviews.rating" }
      }
    },
    { $sort: { avgRating: -1 } }
  ]);

  res.json(stats);
};

export const booksByDecade = async (_req: Request, res: Response) => {
  const stats = await Book.aggregate([
    {
      $addFields: {
        decade: { 
          $subtract: [
            "$year", 
            { $mod: ["$year", 10] }    // Get decade (1920, 1930, etc.)
          ]
        }
      }
    },
    { $unwind: "$reviews" },
    {
      $group: {
        _id: "$decade",
        bookCount: { $addToSet: "$_id" },        // Unique book IDs
        avgRating: { $avg: "$reviews.rating" },
        totalReviews: { $sum: 1 }
      }
    },
    {
      $project: {
        decade: "$_id",
        bookCount: { $size: "$bookCount" },      // Count unique books
        avgRating: { $round: ["$avgRating", 2] },
        totalReviews: 1,
        _id: 0
      }
    },
    { $sort: { decade: 1 } }
  ]);
  res.json(stats);
};


export const topRatedBooks = async (_req: Request, res: Response) => {
  const books = await Book.aggregate([
    { $unwind: "$reviews" },
    {
      $group: {
        _id: "$_id",
        title: { $first: "$title" },
        author: { $first: "$author" },
        avgRating: { $avg: "$reviews.rating" },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $match: { 
        reviewCount: { $gte: 2 }              // At least 2 reviews
      }
    },
    { $sort: { avgRating: -1 } },
    { $limit: 10 }
  ]);
  res.json(books);
};