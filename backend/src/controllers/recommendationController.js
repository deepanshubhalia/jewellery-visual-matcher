import { recommendationService } from '../services/recommendationService.js';

/**
 * Health check endpoint controller.
 */
export async function handleHealthCheck(req, res) {
  try {
    return res.status(200).json({
      status: 'ok',
      serviceReady: recommendationService.isReady,
      necklaceCount: recommendationService.necklaces.length,
      earringCount: recommendationService.earringEmbeddings.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    });
  }
}

/**
 * Returns available necklaces in inventory.
 */
export async function handleGetNecklaces(req, res) {
  try {
    const necklaces = recommendationService.getNecklaces();
    return res.status(200).json({
      necklaces,
      count: necklaces.length,
    });
  } catch (error) {
    console.error('[Controller Error] handleGetNecklaces:', error);
    return res.status(500).json({
      error: 'Failed to retrieve necklaces',
      message: error.message,
    });
  }
}

/**
 * Generates earring recommendations for an uploaded necklace image.
 */
export async function handleRecommend(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No image file uploaded. Please provide an image file under the "file" field.',
      });
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid File Type',
        message: `Supported image formats are JPEG, PNG, and WebP. Received: ${req.file.mimetype}`,
      });
    }

    const topK = parseInt(req.query.top_k || req.body.top_k, 10) || 3;
    const necklaceId = req.body.necklace_id || req.body.id || null;

    const result = await recommendationService.getRecommendations(
      req.file.buffer,
      {
        id: necklaceId,
        image_file: req.file.originalname,
      },
      topK
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Controller Error] handleRecommend:', error);

    const isWarmupError = error.message.includes('warming up');
    const statusCode = isWarmupError ? 503 : 500;

    return res.status(statusCode).json({
      error: isWarmupError ? 'Service Unavailable' : 'Recommendation Error',
      message: error.message,
    });
  }
}
