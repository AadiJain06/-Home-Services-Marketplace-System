import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import bookingsRouter from './routes/bookings.js';
import providersRouter from './routes/providers.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Routes
    app.use('/api/bookings', bookingsRouter);
    app.use('/api/providers', providersRouter);
    app.use('/api/admin', adminRouter);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
