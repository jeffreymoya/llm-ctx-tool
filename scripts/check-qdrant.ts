import 'dotenv/config';
import { QdrantClient } from '@qdrant/js-client-rest';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';

async function checkQdrantStatus() {
  console.log(`Attempting to connect to Qdrant at ${QDRANT_URL}...`);
  const client = new QdrantClient({ url: QDRANT_URL });

  try {
    // A simple way to check connectivity is to list collections.
    // This doesn't require an API key if Qdrant security is not enabled.
    const response = await client.getCollections();
    console.log('Successfully connected to Qdrant.');
    console.log('Available collections:', response.collections.map(c => c.name));
    // You can add more checks here, e.g., try to get a specific collection info
  } catch (error) {
    console.error('Failed to connect to Qdrant or list collections:', error);
    process.exit(1); // Exit with error code
  }
}

checkQdrantStatus(); 