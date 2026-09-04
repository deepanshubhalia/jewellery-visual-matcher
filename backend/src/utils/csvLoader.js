import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

/**
 * Loads and validates inventory dataset from candidate CSV file.
 *
 * @param {string} csvFilePath - Path to candidate_dataset.csv
 * @param {string} imageDirPath - Path to image directory
 * @returns {Promise<{ necklaces: Array, earrings: Array, all: Array }>}
 */
export async function loadJewelleryDataset(csvFilePath, imageDirPath) {
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`Dataset CSV file not found at: ${csvFilePath}`);
  }

  if (!fs.existsSync(imageDirPath)) {
    throw new Error(`Image directory not found at: ${imageDirPath}`);
  }

  const records = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => {
        // Normalize fields
        const id = (row.id || '').trim();
        const productType = (row.product_type || '').trim();
        const imageFile = (row.image_file || '').trim();

        if (id && productType && imageFile) {
          records.push({
            id,
            product_type: productType,
            image_file: imageFile,
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  if (records.length === 0) {
    throw new Error(`Dataset at ${csvFilePath} is empty or invalid.`);
  }

  const necklaces = [];
  const earrings = [];

  for (const item of records) {
    const fullImagePath = path.resolve(imageDirPath, item.image_file);

    if (!fs.existsSync(fullImagePath)) {
      console.warn(`[Warning] Image file referenced in CSV not found: ${fullImagePath}`);
    }

    const itemWithMeta = {
      id: item.id,
      product_type: item.product_type,
      image_file: item.image_file,
      image_url: `/images/${item.image_file}`,
      full_path: fullImagePath,
    };

    if (item.product_type.toLowerCase() === 'necklace') {
      necklaces.push(itemWithMeta);
    } else if (item.product_type.toLowerCase() === 'earrings') {
      earrings.push(itemWithMeta);
    } else {
      console.warn(`[Warning] Unknown product_type: "${item.product_type}" for item ID ${item.id}`);
    }
  }

  return {
    necklaces,
    earrings,
    all: [...necklaces, ...earrings],
  };
}
