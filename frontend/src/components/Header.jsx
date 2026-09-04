import React from 'react';

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-brand">
        <h1 className="header-title">Jewellery Match</h1>
      </div>

      <p className="header-subtitle">
        Find the perfect matching earrings for your necklace using visual feature embeddings and cosine similarity
      </p>
    </header>
  );
}
