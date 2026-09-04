const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

/**
 * Checks backend health and warmup status.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches available necklaces from the backend inventory.
 */
export async function fetchNecklaces() {
  const response = await fetch(`${API_BASE_URL}/api/necklaces`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch necklaces (${response.status})`);
  }
  return response.json();
}

/**
 * Sends a necklace image to the recommendation endpoint.
 *
 * @param {Blob|File} imageBlob - The image file or blob
 * @param {string} filename - Filename of the necklace image
 * @param {string} necklaceId - Product ID of the necklace
 * @param {number} topK - Number of recommendations requested (default 3)
 */
export async function fetchRecommendations(imageBlob, filename = 'necklace.jpg', necklaceId = '', topK = 3) {
  const formData = new FormData();
  formData.append('file', imageBlob, filename);
  if (necklaceId) {
    formData.append('necklace_id', necklaceId);
  }
  formData.append('top_k', topK.toString());

  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Recommendation failed (${response.status})`);
  }

  return response.json();
}

/**
 * Helper to construct full URL for an image.
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
}
