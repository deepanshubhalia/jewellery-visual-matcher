import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, normalizeVector } from '../src/utils/cosineSimilarity.js';

describe('Cosine Similarity Utilities', () => {
  test('should return 1.0 for identical vectors', () => {
    const vecA = new Float32Array([1.0, 2.0, 3.0]);
    const vecB = new Float32Array([1.0, 2.0, 3.0]);
    const sim = cosineSimilarity(vecA, vecB);
    assert.strictEqual(Math.round(sim * 1000) / 1000, 1.0);
  });

  test('should return 0.0 for orthogonal vectors', () => {
    const vecA = new Float32Array([1.0, 0.0]);
    const vecB = new Float32Array([0.0, 1.0]);
    const sim = cosineSimilarity(vecA, vecB);
    assert.strictEqual(sim, 0.0);
  });

  test('should return -1.0 for opposite vectors', () => {
    const vecA = new Float32Array([1.0, 2.0]);
    const vecB = new Float32Array([-1.0, -2.0]);
    const sim = cosineSimilarity(vecA, vecB);
    assert.strictEqual(Math.round(sim * 1000) / 1000, -1.0);
  });

  test('should throw error on dimension mismatch', () => {
    const vecA = new Float32Array([1.0, 2.0]);
    const vecB = new Float32Array([1.0, 2.0, 3.0]);
    assert.throws(() => cosineSimilarity(vecA, vecB), /Vector dimension mismatch/);
  });

  test('should normalize a vector to unit length', () => {
    const vec = new Float32Array([3.0, 4.0]);
    const normalized = normalizeVector(vec);
    assert.strictEqual(normalized.length, 2);
    assert.strictEqual(Math.round(normalized[0] * 10) / 10, 0.6);
    assert.strictEqual(Math.round(normalized[1] * 10) / 10, 0.8);
    const mag = Math.sqrt(normalized[0] ** 2 + normalized[1] ** 2);
    assert.strictEqual(Math.round(mag * 1000) / 1000, 1.0);
  });
});
