import { container } from 'tsyringe';

import type { EmbeddingService, CodeProcessor } from '@ports/index';
import type { VectorStore } from '@ports/VectorStore.ts';

import { OpenAIEmbeddingService } from './openai/OpenAIEmbeddingService.ts';
import { QdrantVectorStore } from './qdrant/QdrantVectorStore.ts';
import { TypeScriptCodeProcessor } from './typescript/TypeScriptCodeProcessor.ts';

// Register adapters
container.registerSingleton<EmbeddingService>('EmbeddingService', OpenAIEmbeddingService);
container.registerSingleton<CodeProcessor>('CodeProcessor', TypeScriptCodeProcessor);
container.registerSingleton<VectorStore>('VectorStore', QdrantVectorStore);

export * from './qdrant/QdrantVectorStore.ts';
export * from './openai/OpenAIEmbeddingService.ts';
export * from './typescript/TypeScriptCodeProcessor.ts';
