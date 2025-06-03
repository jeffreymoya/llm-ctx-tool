import { container } from '@config/container.ts';
import { VectorStore, EmbeddingService, CodeProcessor } from '@ports/index.ts';

import { OpenAIEmbeddingService } from './openai/OpenAIEmbeddingService.ts';
import { QdrantVectorStore } from './qdrant/QdrantVectorStore.ts';
import { TypeScriptCodeProcessor } from './typescript/TypeScriptCodeProcessor.ts';

// Register implementations - only in adapters layer
container.registerSingleton<VectorStore>('VectorStore', QdrantVectorStore);
container.registerSingleton<EmbeddingService>('EmbeddingService', OpenAIEmbeddingService);
container.registerSingleton<CodeProcessor>('CodeProcessor', TypeScriptCodeProcessor);

export * from './qdrant/QdrantVectorStore.ts';
export * from './openai/OpenAIEmbeddingService.ts';
export * from './typescript/TypeScriptCodeProcessor.ts';
