import { Router } from 'express';
import { createBook,getBooks, getBookById, updateBook, deleteBook, searchBooks, updateBookYear, boostOldBooks, addReview, getReviews} from '../controllers/bookController';
import { authenticate } from '../middlewares/authMiddleware';


const router = Router();

router.post('/book/:id/review', addReview);

//i want this route to rewuire authentication so i add the middleware.
router.get('/book/:id/reviews',authenticate, getReviews);

router.get('/book/search', searchBooks);
router.post('/', createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

router.put('/book/:id/update-year', updateBookYear);
router.put('/book/update-old', boostOldBooks);


export default router;
