# Jewellery Visual Matcher

A jewellery recommendation system that recommends visually matching earrings for a selected necklace from a provided jewellery inventory.

## Overview

I use a pretrained CLIP model to generate 512-dimensional image embeddings. Earring embeddings are precomputed and cached when the backend starts. For each selected necklace, its embedding is generated and compared against all 15 cached earring embeddings using cosine similarity. The earrings are then ranked by similarity and the top 3 are returned.

## Architecture

```text
React.js Frontend
       │
       │ POST /api/recommend (necklace image)
       ▼
Node.js + Express Server
       │
       ▼
Pretrained CLIP Model (clip-vit-base-patch32)
       │
       ▼
512-dimensional Image Embedding
       │
       ▼
Cosine Similarity (against 15 cached earring embeddings)
       │
       ▼
Sort Descending & Top 3 Recommendations
       │
       ▼
React.js Frontend (Display Results)
```

## Features

- Inventory necklace selection from 5 candidate necklaces
- In-memory caching of precomputed earring embeddings on server startup
- Pure Node.js image feature extraction using pretrained CLIP
- Cosine similarity calculation for visual matching
- Top 3 earring recommendations with visual match scores
- Full end-to-end automated test suite

## Technology Stack

- **Frontend**: React.js, Vite, CSS
- **Backend**: Node.js, Express.js, Multer, csv-parser
- **AI / Computer Vision**: Pretrained CLIP (`@xenova/transformers`, `clip-vit-base-patch32`)
- **Similarity Metric**: Cosine Similarity

## Project Structure

```text
.
├── backend/
│   ├── data/
│   │   ├── candidate_dataset.csv
│   │   └── images/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── Jewelry Images/
├── candidate_dataset.csv
├── .env.example
├── .gitignore
└── README.md
```

## Quickstart

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:5001`.

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### 3. Run Tests

```bash
cd backend
npm test
```

## API Endpoints

- `GET /api/health` - Check service and cache status
- `GET /api/necklaces` - Get available necklaces
- `POST /api/recommend` - Upload necklace image (`multipart/form-data`) and receive Top 3 earring recommendations
- `GET /images/:filename` - Static image asset serving

## Limitations

- CLIP is a general visual representation model rather than a fine-jewellery domain specialist.
- Visual similarity measures visual texture, shape, and tone rather than subjective fashion styling rules.
- Dataset size is restricted to the provided 20 inventory items.
