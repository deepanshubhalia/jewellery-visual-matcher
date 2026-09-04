import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startServer } from '../src/server.js';
import { recommendationService } from '../src/services/recommendationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let server;
let baseUrl;

describe('Express API Endpoints End-to-End Tests', () => {
  before(async () => {
    // Start an HTTP server on a free ephemeral test port (0)
    server = await startServer(0);
    const address = server.address();
    const port = address.port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(() => {
    if (server) {
      server.close();
    }
  });

  test('GET /api/health returns 200 OK and service status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.serviceReady, true);
    assert.strictEqual(body.necklaceCount, 5);
    assert.strictEqual(body.earringCount, 15);
  });

  test('GET /api/necklaces returns 5 inventory necklaces', async () => {
    const res = await fetch(`${baseUrl}/api/necklaces`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.necklaces));
    assert.strictEqual(body.necklaces.length, 5);

    const first = body.necklaces[0];
    assert.ok(first.id);
    assert.strictEqual(first.product_type, 'Necklace');
    assert.ok(first.image_file);
    assert.ok(first.image_url.startsWith('/images/'));
  });

  test('GET /images/:filename serves static jewellery images', async () => {
    const res = await fetch(`${baseUrl}/images/Nck_1.jpg`);
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type');
    assert.ok(contentType.includes('image/jpeg'));
  });

  test('POST /api/recommend returns top 3 matching earrings for uploaded image', async () => {
    const imagePath = path.join(rootDir, 'data', 'images', 'Nck_1.jpg');
    const imageBuffer = fs.readFileSync(imagePath);

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'Nck_1.jpg');
    formData.append('necklace_id', 'N01');

    const res = await fetch(`${baseUrl}/api/recommend`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.selected_necklace.id, 'N01');
    assert.ok(Array.isArray(body.recommendations));
    assert.strictEqual(body.recommendations.length, 3);

    // Verify recommendations structure and descending order
    const r1 = body.recommendations[0];
    const r2 = body.recommendations[1];
    const r3 = body.recommendations[2];

    assert.ok(r1.similarity_score >= r2.similarity_score);
    assert.ok(r2.similarity_score >= r3.similarity_score);

    for (const rec of body.recommendations) {
      assert.ok(rec.id.startsWith('E'));
      assert.strictEqual(rec.product_type, 'Earrings');
      assert.ok(rec.image_file);
      assert.ok(rec.image_url);
      assert.ok(typeof rec.similarity_score === 'number');
      assert.ok(typeof rec.match_percentage === 'number');
    }
  });

  test('POST /api/recommend returns 400 when file is missing', async () => {
    const formData = new FormData();
    formData.append('necklace_id', 'N01');

    const res = await fetch(`${baseUrl}/api/recommend`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'Bad Request');
  });

  test('POST /api/recommend returns 400 for unsupported file type', async () => {
    const formData = new FormData();
    const blob = new Blob(['sample text'], { type: 'text/plain' });
    formData.append('file', blob, 'sample.txt');

    const res = await fetch(`${baseUrl}/api/recommend`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'Invalid File Type');
    assert.ok(body.message.includes('Unsupported file type'));
  });
});
