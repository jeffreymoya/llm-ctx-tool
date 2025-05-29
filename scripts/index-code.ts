import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import { Document } from "langchain/document";

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || "code_snippets";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SOURCE_DIR = process.env.SOURCE_DIR || "./src"; // Example: scan files in the 'src' directory
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || "800", 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || "100", 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "32", 10);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-004";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "768", 10); // default for text-embedding-004

/**
 * Main function to index code files and store embeddings in Qdrant using Google Gemini embeddings
 * 
 * This script performs the following operations:
 * 1. Loads TypeScript and JavaScript files from the specified source directory
 * 2. Splits the files into manageable chunks for processing
 * 3. Generates embeddings using Google's Gemini embedding model
 * 4. Stores the embeddings in a Qdrant vector database for semantic search
 * 
 * @throws {Error} When GOOGLE_API_KEY is not provided
 * @throws {Error} When document loading fails
 * @throws {Error} When Qdrant connection fails
 * @throws {Error} When adding documents to Qdrant fails
 * 
 * @example
 * Environment variables required:
 * ```bash
 * # Required
 * GOOGLE_API_KEY=your_google_api_key_here
 * 
 * # Optional (with defaults)
 * QDRANT_URL=http://localhost:6333
 * QDRANT_COLLECTION_NAME=code_snippets
 * SOURCE_DIR=./src
 * CHUNK_SIZE=800
 * CHUNK_OVERLAP=100
 * EMBEDDING_MODEL=text-embedding-004
 * EMBEDDING_DIMENSIONS=768
 * BATCH_SIZE=32
 * ```
 * 
 * To run this script:
 * ```bash
 * # Ensure Qdrant is running
 * docker-compose up -d
 * 
 * # Execute the script
 * ts-node scripts/index-code.ts
 * ```
 */
export async function main(): Promise<void> {
  if (!GOOGLE_API_KEY) {
    console.error("Error: GOOGLE_API_KEY is not set in the environment variables.");
    console.error("Get your API key from: https://ai.google.dev/tutorials/setup");
    process.exit(1);
  }

  console.log("Starting code indexing process with Google Gemini embeddings...");

  // 1. Load .ts and .js files
  console.log(`Loading documents from ${SOURCE_DIR}...`);
  const loader = new DirectoryLoader(SOURCE_DIR, {
    ".ts": (path) => new TextLoader(path),
    ".js": (path) => new TextLoader(path),
  }, true, // useRecursive
   "ignore" // errors: 'ignore' | 'warn' | 'error'
  );
  
  let rawDocs: Document[] = [];
  try {
    const loadedDocs = await loader.load();
    rawDocs = loadedDocs || [];
    console.log(`Loaded ${rawDocs.length} raw documents.`);
  } catch (error) {
    console.error("Error loading documents:", error);
    process.exit(1);
  }

  if (rawDocs.length === 0) {
    console.log("No documents found to index. Exiting.");
    return;
  }

  // 2. Employ CharacterTextSplitter
  console.log(`Splitting documents into chunks of ~${CHUNK_SIZE} characters...`);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  let splitDocs: Document[] = [];
  for (const doc of rawDocs) {
    try {
      // Ensure pageContent is a string, as DirectoryLoader might return objects with path etc.
      const content = typeof doc.pageContent === 'string' ? doc.pageContent : JSON.stringify(doc.pageContent);
      const chunks = await textSplitter.splitText(content);
      splitDocs = splitDocs.concat(chunks.map(chunk => new Document({ 
          pageContent: chunk, 
          metadata: { ...doc.metadata, source: doc.metadata.source || 'unknown' } 
      })));
    } catch (error) {
      console.error(`Error splitting document ${doc.metadata.source}:`, error);
      // Continue with other documents
    }
  }
  console.log(`Split into ${splitDocs.length} document chunks.`);

  if (splitDocs.length === 0) {
    console.log("No document chunks to index after splitting. Exiting.");
    return;
  }

  // 3. Instantiate GoogleGenerativeAIEmbeddings
  console.log(`Initializing Google Gemini embeddings with model: ${EMBEDDING_MODEL}...`);
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_API_KEY,
    model: EMBEDDING_MODEL,
  });

  // 4. Establish connection to Qdrant and create collection if it doesn't exist
  console.log(`Connecting to Qdrant at ${QDRANT_URL}...`);
  const qdrantClient = new QdrantClient({ url: QDRANT_URL });

  try {
    const collections = await qdrantClient.getCollections();
    const collectionNames = collections.collections.map(c => c.name);

    if (!collectionNames.includes(QDRANT_COLLECTION_NAME)) {
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' not found. Creating...`);
      await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
        vectors: {
          size: EMBEDDING_DIMENSIONS,
          distance: "Cosine",
        },
      });
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' created with vector size ${EMBEDDING_DIMENSIONS}.`);
    } else {
      console.log(`Using existing collection '${QDRANT_COLLECTION_NAME}'.`);
    }
  } catch (error) {
    console.error("Error connecting to Qdrant or creating collection:", error);
    process.exit(1);
  }

  // 5. Implement logic to addDocuments to Qdrant, managing batching for Qdrant client
  console.log(`Adding ${splitDocs.length} document chunks to Qdrant collection '${QDRANT_COLLECTION_NAME}'...`);
  
  try {
    await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
        client: qdrantClient,
        collectionName: QDRANT_COLLECTION_NAME,
    });
    console.log("All document chunks added to Qdrant successfully.");
  } catch (error) {
     console.error("Error adding documents to Qdrant:", error);
     throw error; // Re-throw for main error handler
  }
  
  console.log("Indexing process completed successfully.");
}

// Run main if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("An unhandled error occurred during the indexing process:", error);
    process.exit(1);
  });
}
