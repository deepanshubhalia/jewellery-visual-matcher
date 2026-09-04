import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { recommendationService } from '../src/services/recommendationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const datasetPath = path.join(rootDir, 'data', 'candidate_dataset.csv');
const imagesPath = path.join(rootDir, 'data', 'images');

describe('Jewellery Recommendation Engine Integration Tests', () => {
  before(async () => {
    // Initialize dataset and precompute embeddings
    await recommendationService.initialize(datasetPath, imagesPath);
  });

  test('should load exactly 5 necklaces from the dataset', () => {
    const necklaces = recommendationService.getNecklaces();
    assert.strictEqual(necklaces.length, 5, 'Should have exactly 5 necklaces');
    const ids = necklaces.map((n) => n.id).sort();
    assert.deepStrictEqual(ids, ['N01', 'N02', 'N03', 'N04', 'N05']);
  });

  test('should precompute embeddings for all 15 candidate earrings', () => {
    assert.strictEqual(
      recommendationService.earringEmbeddings.length,
      15,
      'Should have exactly 15 precomputed earring embeddings'
    );

    // Verify all 15 earrings have valid normalized 512-dim embedding vectors
    for (const earring of recommendationService.earringEmbeddings) {
      assert.ok(earring.id.startsWith('E'), `Earring ID should start with E: ${earring.id}`);
      assert.strictEqual(earring.product_type, 'Earrings');
      assert.ok(earring.embedding instanceof Float32Array);
      assert.strictEqual(earring.embedding.length, 512);
    }
  });

  test('should generate top 3 matching earrings for each of the 5 necklaces', async () => {
    const necklaces = recommendationService.getNecklaces();
    const validEarringIds = new Set(recommendationService.earringEmbeddings.map((e) => e.id));

    for (const necklace of necklaces) {
      const fullPath = path.join(imagesPath, necklace.image_file);
      const imageBuffer = fs.readFileSync(fullPath);

      const response = await recommendationService.getRecommendations(
        imageBuffer,
        { id: necklace.id, image_file: necklace.image_file },
        3
      );

      assert.ok(response.recommendations, 'Response must contain recommendations');
      assert.strictEqual(response.recommendations.length, 3, 'Must return exactly Top 3 earrings');

      // Verify recommendations are sorted in descending order of similarity score
      const scores = response.recommendations.map((r) => r.similarity_score);
      assert.ok(
        scores[0] >= scores[1] && scores[1] >= scores[2],
        `Recommendations for ${necklace.id} must be sorted descending: ${scores.join(', ')}`
      );

      // Verify every recommendation belongs to the 15 candidate earrings
      for (const rec of response.recommendations) {
        assert.ok(
          validEarringIds.has(rec.id),
          `Recommended item ${rec.id} must exist in the 15 candidate earrings`
        );
        assert.strictEqual(rec.product_type, 'Earrings');
        assert.ok(
          typeof rec.similarity_score === 'number' && !isNaN(rec.similarity_score),
          'Similarity score must be a valid number'
        );
        assert.ok(
          rec.similarity_score >= -1 && rec.similarity_score <= 1,
          'Similarity score must be within [-1, 1]'
        );
        assert.ok(
          rec.match_percentage >= 0 && rec.match_percentage <= 100,
          'Match percentage must be within [0, 100]'
        );
      }

      console.log(
        `[Test Verified] Necklace ${necklace.id} (${necklace.image_file}) matches:`,
        response.recommendations.map((r) => `${r.id} (${r.similarity_score})`).join(' > ')
      );
    }
  });
});
