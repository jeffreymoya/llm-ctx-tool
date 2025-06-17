import { container } from 'tsyringe';

import type { EmbeddingService, CodeProcessor, Logger } from '../ports/index.ts';
import type { VectorStore } from '../ports/index.ts';

import { PinoLogger } from './logging/PinoLogger.ts';
import { OpenAIEmbeddingService } from './openai/OpenAIEmbeddingService.ts';
import { QdrantVectorStore } from './qdrant/QdrantVectorStore.ts';
import { TypeScriptCodeProcessor } from './typescript/TypeScriptCodeProcessor.ts';

// Register adapters
container.registerSingleton<EmbeddingService>('EmbeddingService', OpenAIEmbeddingService);
container.registerSingleton<CodeProcessor>('CodeProcessor', TypeScriptCodeProcessor);
container.registerSingleton<VectorStore>('VectorStore', QdrantVectorStore);
container.registerSingleton<Logger>('Logger', PinoLogger);

export * from './qdrant/QdrantVectorStore.ts';
export * from './openai/OpenAIEmbeddingService.ts';
export * from './typescript/TypeScriptCodeProcessor.ts';
export * from './logging/PinoLogger.ts';
