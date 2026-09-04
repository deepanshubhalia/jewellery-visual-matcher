import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import { recommendationService } from './services/recommendationService.js';

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 5005;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';


const datasetPath = process.env.DATASET_PATH
  ? path.resolve(rootDir, process.env.DATASET_PATH)
  : path.join(rootDir, 'data', 'candidate_dataset.csv');

const imagesPath = process.env.IMAGES_PATH
  ? path.resolve(rootDir, process.env.IMAGES_PATH)
  : path.join(rootDir, 'data', 'images');

// Middlewares
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static jewellery images
app.use('/images', express.static(imagesPath));

// Mount API routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Jewellery Recommendation API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      necklaces: 'GET /api/necklaces',
      recommend: 'POST /api/recommend (multipart/form-data with "file")',
      images: 'GET /images/:filename',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error Middleware]:', err.message);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message,
    });
  }

  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({
      error: 'Invalid File Type',
      message: err.message,
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

// Start server & initialize AI recommendation engine
export async function startServer(port = PORT) {
  try {
    const server = app.listen(port, () => {
      console.log(`====================================================`);
      console.log(`  Jewellery Recommendation API Server`);
      console.log(`  Running at: http://localhost:${port}`);
      console.log(`  Static Images: http://localhost:${port}/images/`);
      console.log(`====================================================`);
    });

    // Initialize dataset and precalculate earring embeddings
    await recommendationService.initialize(datasetPath, imagesPath);
    return server;
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

// Auto-run when executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export default app;
