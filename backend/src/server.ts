import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'SwipeThrift API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
