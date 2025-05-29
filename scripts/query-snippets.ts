import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const QDRANT_COLLECTION_NAME = "code_snippets";
const EMBEDDING_MODEL = "text-embedding-ada-002"; // or your preferred model

if (!QDRANT_URL) {
  console.error("Error: QDRANT_URL environment variable is not set.");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is not set.");
  process.exit(1);
}

const qdrantClient = new QdrantClient({ 
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY 
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function getQueryEmbedding(query: string): Promise<number[]> {
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
    });
    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding from OpenAI:", error);
    throw new Error("Failed to get query embedding.");
  }
}

async function searchSnippets(embedding: number[], limit: number = 5) {
  try {
    const searchResult = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
      vector: embedding,
      limit: limit,
      with_payload: true,
    });
    return searchResult;
  } catch (error) {
    console.error("Error searching Qdrant:", error);
    throw new Error("Failed to search snippets in Qdrant.");
  }
}

export async function main(queryString: string) {
  if (!queryString || queryString.trim() === "") {
    console.error("Error: Query string cannot be empty.");
    process.exit(1);
  }

  try {
    console.log(`Querying for: "${queryString}"`);
    const embedding = await getQueryEmbedding(queryString);
    console.log("Embedding received, searching Qdrant...");
    const results = await searchSnippets(embedding);
    console.log("Search results:");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    // Errors are already logged in the respective functions
    process.exit(1);
  }
}

// Call main only if the script is run directly (for testing or npm script)
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: ts-node scripts/query-snippets.ts <query_string>");
    process.exit(1);
  }
  main(args.join(" ")).catch(() => process.exit(1));
} 