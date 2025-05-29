import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';

let qdrantClient: QdrantClient | null = null;

export const getQdrantClient = (): QdrantClient => {
  if (!qdrantClient) {
    try {
      qdrantClient = new QdrantClient({ url: qdrantUrl });
      console.log('Successfully connected to Qdrant.');
    } catch (error) {
      console.error('Failed to connect to Qdrant:', error);
      process.exit(1);
    }
  }
  return qdrantClient;
};

export const testQdrantConnection = async (): Promise<void> => {
  const client = getQdrantClient();
  try {
    // Perform a simple operation to test the connection, e.g., listing collections
    await client.getCollections();
    console.log('Qdrant connection test successful.');
  } catch (error) {
    console.error('Qdrant connection test failed:', error);
  }
}; 