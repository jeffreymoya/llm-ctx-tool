import { z } from 'zod';

const envSchema = z.object({
  // Vector Store Configuration
  QDRANT_URL: z.string().url().default('http://localhost:6333'),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().default('llmctx-code'),

  // Embedding Configuration
  EMBED_MODEL: z.enum(['openai', 'minilm', 'ollama']).default('minilm'),
  OPENAI_API_KEY: z.string().optional(),
  OLLAMA_URL: z.string().url().default('http://localhost:11434'),

  // Application Configuration
  INDEX_VERSION: z.string().default('v3'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  MAX_CHUNK_SIZE: z.coerce.number().positive().default(1000),
  CHUNK_OVERLAP: z.coerce.number().min(0).default(200),

  // Performance Configuration
  BATCH_SIZE: z.coerce.number().positive().default(10),
  MAX_WORKERS: z.coerce.number().positive().default(4),

  // Plugin Configuration
  PLUGINS_DIR: z.string().default('./plugins'),
  ENABLED_PLUGINS: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .default(''),

  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Environment = z.infer<typeof envSchema>;

let cachedEnv: Environment | null = null;

export function getEnv(): Environment {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // Linter prefers throwing an error over process.exit
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

// Validate immediately when imported
getEnv();
