import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { pipeline, env, RawImage } from '@xenova/transformers';
import { normalizeVector } from '../utils/cosineSimilarity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsDir = path.resolve(__dirname, '..', '..', 'models');

// Configure transformers cache and environment
env.localModelPath = modelsDir;
env.allowLocalModels = true;
env.useBrowserCache = false;

// Global singleton pipeline instance
let featureExtractor = null;
let currentModelName = process.env.MODEL_NAME || 'Xenova/clip-vit-base-patch32';

/**
 * Initializes and returns the pretrained vision feature extraction pipeline.
 * Ensures the model is loaded only once (Singleton).
 *
 * @param {string} [modelName] - HuggingFace model identifier
 * @returns {Promise<any>} The initialized pipeline
 */
export async function initEmbeddingModel(modelName = currentModelName) {
  if (featureExtractor) {
    return featureExtractor;
  }

  currentModelName = modelName;
  console.log(`[AI Model] Loading pretrained vision model: "${modelName}"...`);
  const startTime = Date.now();

  try {
    featureExtractor = await pipeline('image-feature-extraction', modelName, {
      quantized: true,
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[AI Model] Pretrained model loaded successfully in ${duration}s.`);
    return featureExtractor;
  } catch (error) {
    console.error(`[AI Model] Failed to load model "${modelName}":`, error);
    throw new Error(`Failed to initialize image embedding model: ${error.message}`);
  }
}

/**
 * Generates a normalized 512-dimensional embedding vector for an image.
 *
 * @param {string|Buffer} imageInput - Local file path or Buffer of image
 * @returns {Promise<Float32Array>} Normalized embedding vector
 */
export async function generateImageEmbedding(imageInput) {
  const extractor = await initEmbeddingModel();

  let rawImage;
  if (Buffer.isBuffer(imageInput)) {
    const resizedBuffer = await sharp(imageInput)
      .resize(224, 224, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer();
    const blob = new Blob([resizedBuffer]);
    rawImage = await RawImage.fromBlob(blob);
  } else if (typeof imageInput === 'string') {
    if (!fs.existsSync(imageInput)) {
      throw new Error(`Image file not found at: ${imageInput}`);
    }
    const resizedBuffer = await sharp(imageInput)
      .resize(224, 224, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer();
    const blob = new Blob([resizedBuffer]);
    rawImage = await RawImage.fromBlob(blob);
  } else {
    throw new Error('Unsupported image input format. Expected string path or Buffer.');
  }

  // Extract features
  const tensor = await extractor(rawImage);

  // Extract raw Float32 array from output tensor
  let embedding;
  if (tensor && tensor.data) {
    embedding = tensor.data;
  } else if (Array.isArray(tensor)) {
    embedding = new Float32Array(tensor.flat(Infinity));
  } else {
    throw new Error('Unexpected output format from image feature extractor.');
  }

  // Return normalized vector for cosine similarity
  return normalizeVector(embedding);
}

/**
 * Precomputes and caches embedding vectors for all earring items.
 *
 * @param {Array<{ id: string, image_file: string, full_path: string }>} earringsList
 * @returns {Promise<Array<{ id: string, image_file: string, image_url: string, product_type: string, embedding: Float32Array }>>}
 */
export async function precomputeEarringEmbeddings(earringsList) {
  console.log(`[Embedding Cache] Precomputing embeddings for ${earringsList.length} earrings...`);
  const startTime = Date.now();
  const cachedEmbeddings = [];

  for (let i = 0; i < earringsList.length; i++) {
    const item = earringsList[i];
    try {
      const embedding = await generateImageEmbedding(item.full_path);
      cachedEmbeddings.push({
        id: item.id,
        product_type: item.product_type,
        image_file: item.image_file,
        image_url: item.image_url,
        embedding: embedding,
      });
      console.log(`  [${i + 1}/${earringsList.length}] Embedded: ${item.id} (${item.image_file}) [dim: ${embedding.length}]`);
    } catch (err) {
      console.error(`  [Error] Failed embedding for ${item.id} (${item.image_file}):`, err.message);
      throw err;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Embedding Cache] All ${cachedEmbeddings.length} earring embeddings cached in ${duration}s.`);
  return cachedEmbeddings;
}
