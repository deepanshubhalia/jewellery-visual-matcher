import React from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../api/client.js';

export default function SelectedPreview({
  selectedNecklace,
  onFindMatches,
  isRecommending,
}) {
  const imageUrl = selectedNecklace
    ? (selectedNecklace.previewUrl || getImageUrl(selectedNecklace.image_url))
    : null;

  return (
    <section className="section-container preview-section">
      <div className="preview-card">
        <div className="preview-header">
          <div className="section-step-indicator">
            <span>Step 2</span>
          </div>
          <h2 className="section-title">Selected Necklace Preview</h2>
        </div>

        <div className="preview-content">
          <div className="preview-image-box">
            {selectedNecklace ? (
              <img
                src={imageUrl}
                alt={`Selected Necklace ${selectedNecklace.id}`}
                className="preview-large-image"
              />
            ) : (
              <div className="preview-placeholder">
                <ImageIcon size={48} className="placeholder-icon" />
                <p className="placeholder-text">Select or upload a necklace image above to preview</p>
              </div>
            )}
          </div>

          <div className="preview-actions-box">
            <div className="preview-details">
              <span className="detail-label">Current Selection</span>
              <h3 className="detail-value">
                {selectedNecklace
                  ? (selectedNecklace.isCustom ? 'Custom Uploaded Image' : `Necklace ${selectedNecklace.id}`)
                  : 'No necklace selected'}
              </h3>
              {selectedNecklace && (
                <div className="detail-meta">
                  <span className="meta-pill">File: {selectedNecklace.image_file}</span>
                  <span className="meta-pill">Type: {selectedNecklace.product_type}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`match-cta-button ${!selectedNecklace || isRecommending ? 'disabled' : ''}`}
              onClick={onFindMatches}
              disabled={!selectedNecklace || isRecommending}
            >
              <Search size={20} className={isRecommending ? 'spinning' : ''} />
              <span>{isRecommending ? 'Analyzing Visual Features...' : 'Find Matching Earrings'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
