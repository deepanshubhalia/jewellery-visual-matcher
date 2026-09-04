import React from 'react';
import { Check } from 'lucide-react';
import { getImageUrl } from '../api/client.js';

export default function NecklaceCard({ necklace, isSelected, onSelect }) {
  const imageUrl = getImageUrl(necklace.image_url);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`necklace-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(necklace)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(necklace);
        }
      }}
    >
      <div className="necklace-image-wrapper">
        <img
          src={imageUrl}
          alt={`Necklace ${necklace.id}`}
          className="necklace-image"
          loading="lazy"
        />
        {isSelected && (
          <div className="selected-check-badge">
            <Check size={16} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="necklace-meta">
        <span className="necklace-id-badge">{necklace.id}</span>
        <span className="necklace-type-label">Necklace</span>
      </div>
    </div>
  );
}
