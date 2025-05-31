import { container } from 'tsyringe';
import { QdrantVectorStore } from './qdrant/QdrantVectorStore';
import { QdrantClient } from '@qdrant/js-client-rest';

// Register implementations
const qdrantClient = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' });
container.register('VectorStore', { useValue: new QdrantVectorStore(qdrantClient) });

export * from './qdrant/QdrantVectorStore';
