import path from 'path';
import fs from 'fs';
import { loadJewelleryDataset } from '../utils/csvLoader.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';
import {
  initEmbeddingModel,
  generateImageEmbedding,
  precomputeEarringEmbeddings,
} from './embeddingService.js';

class RecommendationService {
  constructor() {
    this.isReady = false;
    this.necklaces = [];
    this.necklaceEmbeddings = {};
    this.earringEmbeddings = [];
    this.datasetPath = '';
    this.imagesPath = '';
  }

  /**
   * Initializes dataset and precomputes earring embeddings cache.
   *
   * @param {string} datasetPath - Path to candidate_dataset.csv
   * @param {string} imagesPath - Path to images folder
   */
  async initialize(datasetPath, imagesPath) {
    this.datasetPath = path.resolve(datasetPath);
    this.imagesPath = path.resolve(imagesPath);

    console.log('[RecommendationService] Initializing service...');
    console.log(`  Dataset Path: ${this.datasetPath}`);
    console.log(`  Images Path:  ${this.imagesPath}`);

    // 1. Load and parse dataset
    const dataset = await loadJewelleryDataset(this.datasetPath, this.imagesPath);
    this.necklaces = dataset.necklaces;
    const rawEarrings = dataset.earrings;

    console.log(
      `[RecommendationService] Dataset loaded: ${this.necklaces.length} Necklaces, ${rawEarrings.length} Earrings.`
    );

    if (rawEarrings.length === 0) {
      throw new Error('No earrings found in dataset. Cannot initialize recommendations.');
    }

    // 2. Precompute or load cached earring embeddings
    const cachedEmbeddingsPath = path.join(path.dirname(this.datasetPath), 'earring_embeddings.json');
    if (fs.existsSync(cachedEmbeddingsPath)) {
      console.log('[RecommendationService] Loading precomputed earring embeddings from JSON cache...');
      const rawCache = JSON.parse(fs.readFileSync(cachedEmbeddingsPath, 'utf-8'));
      this.earringEmbeddings = rawCache.map((item) => ({
        id: item.id,
        product_type: item.product_type,
        image_file: item.image_file,
        image_url: item.image_url,
        embedding: new Float32Array(item.embedding),
      }));
      console.log(`[RecommendationService] Loaded ${this.earringEmbeddings.length} cached earring embeddings.`);
    } else {
      await initEmbeddingModel();
      this.earringEmbeddings = await precomputeEarringEmbeddings(rawEarrings);
    }

    // Load precomputed necklace embeddings for instant visual matching
    const cachedNecklacesPath = path.join(path.dirname(this.datasetPath), 'necklace_embeddings.json');
    if (fs.existsSync(cachedNecklacesPath)) {
      const rawNecklaces = JSON.parse(fs.readFileSync(cachedNecklacesPath, 'utf-8'));
      this.necklaceEmbeddings = {};
      for (const [id, emb] of Object.entries(rawNecklaces)) {
        this.necklaceEmbeddings[id] = new Float32Array(emb);
      }
      console.log(`[RecommendationService] Loaded ${Object.keys(this.necklaceEmbeddings).length} precomputed necklace embeddings.`);
    }

    this.isReady = true;
    console.log('[RecommendationService] Recommendation Service is ready!');
  }

  /**
   * Returns list of available necklaces from the inventory.
   *
   * @returns {Array<{ id: string, product_type: string, image_file: string, image_url: string }>}
   */
  getNecklaces() {
    return this.necklaces.map(({ id, product_type, image_file, image_url }) => ({
      id,
      product_type,
      image_file,
      image_url,
    }));
  }

  /**
   * Recommends Top K matching earrings for a given necklace image.
   *
   * @param {Buffer|string} necklaceImageInput - Image Buffer or local file path
   * @param {object} [meta] - Optional metadata (e.g. filename)
   * @param {number} [topK=3] - Number of recommendations to return
   * @returns {Promise<{ selected_necklace: object, recommendations: Array }>}
   */
  async getRecommendations(necklaceImageInput, meta = {}, topK = 3) {
    if (!this.isReady) {
      throw new Error('Recommendation service is still warming up. Please try again in a few seconds.');
    }

    const startTime = Date.now();

    // 1. Check if we have precomputed embedding for this necklace or generate on the fly
    let necklaceEmbedding;
    if (meta.id && this.necklaceEmbeddings && this.necklaceEmbeddings[meta.id]) {
      necklaceEmbedding = this.necklaceEmbeddings[meta.id];
    } else {
      necklaceEmbedding = await generateImageEmbedding(necklaceImageInput);
    }

    // 2. Calculate cosine similarity against all 15 cached earrings
    const scoredEarrings = this.earringEmbeddings.map((earring) => {
      const similarity = cosineSimilarity(necklaceEmbedding, earring.embedding);

      // Visual match percentage between 0% and 100%
      const matchPercentage = Math.round(Math.max(0, similarity) * 100);

      return {
        id: earring.id,
        product_type: earring.product_type,
        image_file: earring.image_file,
        image_url: earring.image_url,
        similarity_score: Number(similarity.toFixed(4)),
        match_percentage: matchPercentage,
      };
    });

    // 3. Sort descending by similarity score
    scoredEarrings.sort((a, b) => b.similarity_score - a.similarity_score);

    // 4. Return Top K
    const recommendations = scoredEarrings.slice(0, topK);
    const latencyMs = Date.now() - startTime;

    return {
      selected_necklace: {
        id: meta.id || null,
        image_file: meta.image_file || 'uploaded_image',
      },
      recommendations,
      meta: {
        total_candidates_evaluated: this.earringEmbeddings.length,
        top_k: topK,
        latency_ms: latencyMs,
      },
    };
  }
}

export const recommendationService = new RecommendationService();
