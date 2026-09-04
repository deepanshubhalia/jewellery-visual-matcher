import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import NecklaceCard from './NecklaceCard.jsx';

export default function NecklaceSelector({
  necklaces,
  selectedNecklace,
  onSelectNecklace,
  onUploadCustomImage,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState(selectedNecklace?.isCustom ? 'upload' : 'inventory');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function processFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    setActiveTab('upload');
    onUploadCustomImage(file);
  }

  return (
    <section className="section-container selector-section">
      <div className="section-header">
        <div className="section-step-indicator">
          <span>Step 1</span>
        </div>
        <h2 className="section-title">Select or Upload Necklace</h2>
      </div>

      <p className="section-description">
        Choose a necklace from our curated inventory or upload your own test image to evaluate the AI visual matcher with custom jewellery.
      </p>

      {/* Tabs */}
      <div className="selector-tabs">
        <button
          type="button"
          className={`selector-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Sparkles size={16} />
          <span>Curated Inventory ({necklaces.length})</span>
        </button>

        <button
          type="button"
          className={`selector-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={16} />
          <span>Upload Custom Test Image</span>
          {selectedNecklace?.isCustom && <span className="tab-indicator-badge">Selected</span>}
        </button>
      </div>

      {/* Tab 1: Curated Inventory */}
      {activeTab === 'inventory' && (
        <div className="tab-content inventory-tab">
          {isLoading ? (
            <div className="skeleton-grid">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="necklace-grid">
              {necklaces.map((necklace) => (
                <NecklaceCard
                  key={necklace.id}
                  necklace={necklace}
                  isSelected={!selectedNecklace?.isCustom && selectedNecklace?.id === necklace.id}
                  onSelect={onSelectNecklace}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upload Custom Image */}
      {activeTab === 'upload' && (
        <div className="tab-content upload-tab">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />

          <div
            className={`dropzone-box ${isDragging ? 'dragging' : ''} ${selectedNecklace?.isCustom ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedNecklace?.isCustom ? (
              <div className="dropzone-preview-card">
                <img
                  src={selectedNecklace.previewUrl}
                  alt="Uploaded Necklace"
                  className="dropzone-preview-thumb"
                />
                <div className="dropzone-preview-info">
                  <div className="dropzone-badge-success">
                    <CheckCircle2 size={16} />
                    <span>Image Ready for Visual Matching</span>
                  </div>
                  <h4 className="dropzone-file-name">{selectedNecklace.image_file}</h4>
                  <p className="dropzone-help-text">Click or drag & drop to choose a different image</p>
                </div>
              </div>
            ) : (
              <div className="dropzone-prompt">
                <div className="dropzone-icon-circle">
                  <Upload size={32} />
                </div>
                <h3 className="dropzone-title">Click to upload or drag & drop</h3>
                <p className="dropzone-sub">
                  Supports high-resolution JPG, PNG, or WebP necklace photos
                </p>
                <button type="button" className="dropzone-browse-btn">
                  Browse File
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
