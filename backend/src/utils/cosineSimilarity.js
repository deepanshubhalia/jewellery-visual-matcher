/**
 * Calculates the cosine similarity between two numeric vectors.
 *
 * Formula:
 *   cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
 *
 * @param {number[]|Float32Array} vecA - First vector
 * @param {number[]|Float32Array} vecB - Second vector
 * @returns {number} Cosine similarity score between -1 and 1
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) {
    throw new Error('Both vectors must be provided.');
  }

  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vector dimension mismatch: vecA (${vecA.length}) vs vecB (${vecB.length})`
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const valA = vecA[i];
    const valB = vecB[i];

    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitudeA = Math.sqrt(normA);
  const magnitudeB = Math.sqrt(normB);

  // Guard against division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  const similarity = dotProduct / (magnitudeA * magnitudeB);

  // Clamp to [-1, 1] to eliminate floating point rounding errors
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Normalizes a vector to unit length (L2 norm).
 *
 * @param {number[]|Float32Array} vec - Input vector
 * @returns {Float32Array} Normalized unit vector
 */
export function normalizeVector(vec) {
  if (!vec || vec.length === 0) {
    throw new Error('Vector cannot be empty.');
  }

  let sumSquares = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSquares += vec[i] * vec[i];
  }

  const magnitude = Math.sqrt(sumSquares);
  if (magnitude === 0) {
    return new Float32Array(vec.length);
  }

  const normalized = new Float32Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    normalized[i] = vec[i] / magnitude;
  }

  return normalized;
}
