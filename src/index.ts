import express from 'express';
import externalApiRoutes from './routes/externalApiRoutes';
import bookRoutes from './routes/bookRoutes';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';
import connectDB from './config/database';


dotenv.config();
connectDB();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', externalApiRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/user',userRoutes );

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});




