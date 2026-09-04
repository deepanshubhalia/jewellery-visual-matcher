import React from 'react';
import { Award, Eye } from 'lucide-react';
import { getImageUrl } from '../api/client.js';

export default function RecommendationCard({ recommendation, rank }) {
  const imageUrl = getImageUrl(recommendation.image_url);
  const matchPct = recommendation.match_percentage ?? Math.round(recommendation.similarity_score * 100);

  const getRankBadgeColor = (r) => {
    switch (r) {
      case 1:
        return 'gold-badge';
      case 2:
        return 'silver-badge';
      case 3:
        return 'bronze-badge';
      default:
        return 'default-badge';
    }
  };

  return (
    <div className="recommendation-card">
      <div className="card-top-bar">
        <div className={`rank-badge ${getRankBadgeColor(rank)}`}>
          <Award size={14} />
          <span>#{rank} Match</span>
        </div>
        <div className="score-badge">
          <Eye size={13} />
          <span>{matchPct}% Visual Match</span>
        </div>
      </div>

      <div className="recommendation-image-box">
        <img
          src={imageUrl}
          alt={`Earring ${recommendation.id}`}
          className="recommendation-image"
          loading="lazy"
        />
      </div>

      <div className="recommendation-info">
        <div className="recommendation-header-row">
          <span className="earring-id-tag">Earring {recommendation.id}</span>
          <span className="earring-filename">{recommendation.image_file}</span>
        </div>

        {/* Visual match score progress bar */}
        <div className="similarity-meter-wrap">
          <div className="similarity-meter-header">
            <span className="meter-label">CLIP Feature Similarity</span>
            <span className="meter-score">{(recommendation.similarity_score).toFixed(4)}</span>
          </div>
          <div className="similarity-progress-bg">
            <div
              className="similarity-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, matchPct))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
