import React from 'react';
import { Loader2, Info, Compass } from 'lucide-react';
import RecommendationCard from './RecommendationCard.jsx';

export default function RecommendationGrid({
  recommendations,
  isLoading,
  selectedNecklace,
  hasRequestedMatches,
}) {
  return (
    <section className="section-container recommendations-section">
      <div className="section-header">
        <div className="section-step-indicator">
          <span>Step 3</span>
        </div>
        <h2 className="section-title">Top Matching Earrings</h2>
        {recommendations.length > 0 && (
          <span className="section-count-badge">{recommendations.length} Recommendations</span>
        )}
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div className="status-container loading-state">
          <div className="spinner-wrap">
            <Loader2 className="spinner-icon" size={40} />
          </div>
          <h3 className="status-title">Finding the best matches...</h3>
          <p className="status-subtitle">
            Extracting deep visual feature embeddings and evaluating cosine similarity against the 15 candidate earrings.
          </p>
        </div>
      )}

      {/* 2. Initial State (No necklace selected or no request made yet) */}
      {!isLoading && !hasRequestedMatches && (
        <div className="status-container initial-state">
          <div className="status-icon-wrap">
            <Compass size={36} />
          </div>
          <h3 className="status-title">Select a necklace to find matching earrings.</h3>
          <p className="status-subtitle">
            Once selected, our vision model will analyze visual characteristics and rank the top 3 visually matching earrings from the inventory.
          </p>
        </div>
      )}

      {/* 3. Empty Results State (if request made but empty) */}
      {!isLoading && hasRequestedMatches && recommendations.length === 0 && (
        <div className="status-container empty-state">
          <div className="status-icon-wrap">
            <Info size={36} />
          </div>
          <h3 className="status-title">No matching earrings found</h3>
          <p className="status-subtitle">
            Please try selecting a different necklace from the collection.
          </p>
        </div>
      )}

      {/* 4. Success State (Top 3 Recommendations) */}
      {!isLoading && recommendations.length > 0 && (
        <div className="recommendations-container">
          <div className="recommendation-grid">
            {recommendations.map((item, index) => (
              <RecommendationCard
                key={item.id}
                recommendation={item}
                rank={index + 1}
              />
            ))}
          </div>

          <div className="recommendation-footnote">
            <Info size={14} className="footnote-icon" />
            <span>
              Match score indicates visual feature similarity computed via CLIP image embeddings and normalized cosine distance across the 15 candidate earrings.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
