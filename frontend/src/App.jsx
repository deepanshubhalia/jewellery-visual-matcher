import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import NecklaceSelector from './components/NecklaceSelector.jsx';
import SelectedPreview from './components/SelectedPreview.jsx';
import RecommendationGrid from './components/RecommendationGrid.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import { fetchNecklaces, fetchRecommendations, getImageUrl } from './api/client.js';

export default function App() {
  const [necklaces, setNecklaces] = useState([]);
  const [selectedNecklace, setSelectedNecklace] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingNecklaces, setIsLoadingNecklaces] = useState(true);
  const [isRecommending, setIsRecommending] = useState(false);
  const [hasRequestedMatches, setHasRequestedMatches] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load necklaces on initial mount
  useEffect(() => {
    loadNecklaces();
  }, []);

  async function loadNecklaces() {
    setIsLoadingNecklaces(true);
    setErrorMessage(null);
    try {
      const data = await fetchNecklaces();
      setNecklaces(data.necklaces || []);
      // Pre-select the first necklace for smooth onboarding if desired
      if (data.necklaces && data.necklaces.length > 0) {
        setSelectedNecklace(data.necklaces[0]);
      }
    } catch (err) {
      console.error('Failed to load necklaces:', err);
      setErrorMessage(
        'Unable to connect to the backend server. Please make sure the backend is running on http://localhost:5005.'
      );
    } finally {
      setIsLoadingNecklaces(false);
    }
  }

  function handleSelectNecklace(necklace) {
    setSelectedNecklace(necklace);
    setRecommendations([]);
    setHasRequestedMatches(false);
    setErrorMessage(null);
  }

  function handleUploadCustomImage(file) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const customItem = {
      id: 'Custom Upload',
      product_type: 'Necklace (Custom Upload)',
      image_file: file.name,
      file: file,
      previewUrl: previewUrl,
      isCustom: true,
    };
    setSelectedNecklace(customItem);
    setRecommendations([]);
    setHasRequestedMatches(false);
    setErrorMessage(null);
  }

  async function handleFindMatches() {
    if (!selectedNecklace) return;

    setIsRecommending(true);
    setErrorMessage(null);
    setHasRequestedMatches(true);

    try {
      let imageBlob;
      let filename = selectedNecklace.image_file || 'necklace.jpg';
      let necklaceId = selectedNecklace.isCustom ? 'custom' : (selectedNecklace.id || '');

      if (selectedNecklace.isCustom && selectedNecklace.file) {
        imageBlob = selectedNecklace.file;
      } else {
        // Fetch the selected necklace image as a Blob to upload to POST /api/recommend
        const imageUrl = getImageUrl(selectedNecklace.image_url);
        const imgResponse = await fetch(imageUrl);

        if (!imgResponse.ok) {
          throw new Error(`Failed to load necklace image (${imgResponse.status})`);
        }

        imageBlob = await imgResponse.blob();
      }

      // Submit image to recommendation endpoint
      const result = await fetchRecommendations(
        imageBlob,
        filename,
        necklaceId,
        3
      );

      setRecommendations(result.recommendations || []);
    } catch (err) {
      console.error('Error finding matches:', err);
      setErrorMessage(
        err.message || 'Something went wrong while finding matches. Please try again.'
      );
      setRecommendations([]);
    } finally {
      setIsRecommending(false);
    }
  }

  return (
    <div className="app-layout">
      <div className="main-wrapper">
        <Header />

        <ErrorBanner
          message={errorMessage}
          onRetry={necklaces.length === 0 ? loadNecklaces : handleFindMatches}
          onDismiss={() => setErrorMessage(null)}
        />

        <main className="app-main">
          {/* Step 1: Necklace Selector */}
          <NecklaceSelector
            necklaces={necklaces}
            selectedNecklace={selectedNecklace}
            onSelectNecklace={handleSelectNecklace}
            onUploadCustomImage={handleUploadCustomImage}
            isLoading={isLoadingNecklaces}
          />

          {/* Step 2: Selected Necklace Large Preview & Action */}
          <SelectedPreview
            selectedNecklace={selectedNecklace}
            onFindMatches={handleFindMatches}
            isRecommending={isRecommending}
          />

          {/* Step 3: Recommendation Results */}
          <RecommendationGrid
            recommendations={recommendations}
            isLoading={isRecommending}
            selectedNecklace={selectedNecklace}
            hasRequestedMatches={hasRequestedMatches}
          />
        </main>

        <footer className="app-footer">
          <p>
            Jewellery Visual Recommendation System
          </p>
        </footer>
      </div>
    </div>
  );
}
