import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

// Mock the modules
jest.mock("@qdrant/js-client-rest");
jest.mock("@langchain/google-genai");
jest.mock("@langchain/qdrant");
jest.mock("langchain/document_loaders/fs/directory");
jest.mock("langchain/text_splitter");
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

const MockedQdrantClient = QdrantClient as jest.MockedClass<typeof QdrantClient>;
const MockedGoogleGenerativeAIEmbeddings = GoogleGenerativeAIEmbeddings as jest.MockedClass<typeof GoogleGenerativeAIEmbeddings>;
const MockedQdrantVectorStore = QdrantVectorStore as jest.MockedClass<typeof QdrantVectorStore>;
const MockedDirectoryLoader = DirectoryLoader as jest.MockedClass<typeof DirectoryLoader>;
const MockedCharacterTextSplitter = CharacterTextSplitter as jest.MockedClass<typeof CharacterTextSplitter>;

describe("index-code script", () => {
  const originalEnv = process.env;
  const originalExit = process.exit;
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules(); // Clear module cache to ensure fresh imports
    process.env = { ...originalEnv };
    process.exit = jest.fn() as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    consoleErrorSpy.mockClear();
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("Expected usage", () => {
    test("should successfully index documents when all dependencies work correctly", async () => {
      // Setup environment
      process.env.GOOGLE_API_KEY = "test-api-key";
      process.env.SOURCE_DIR = "./test-src";
      process.env.QDRANT_COLLECTION_NAME = "test_collection";

      // Mock successful document loading
      const mockDocs = [
        new Document({
          pageContent: "test content 1",
          metadata: { source: "test1.ts" }
        }),
        new Document({
          pageContent: "test content 2",
          metadata: { source: "test2.ts" }
        })
      ];

      const mockDirectoryLoader = {
        load: jest.fn().mockResolvedValue(mockDocs)
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      // Mock text splitter
      const mockTextSplitter = {
        splitText: jest.fn().mockResolvedValue(["chunk1", "chunk2"])
      };
      MockedCharacterTextSplitter.mockImplementation(() => mockTextSplitter as any);

      // Mock Qdrant client
      const mockQdrantClient = {
        getCollections: jest.fn().mockResolvedValue({
          collections: [{ name: "existing_collection" }]
        }),
        createCollection: jest.fn().mockResolvedValue(undefined)
      };
      MockedQdrantClient.mockImplementation(() => mockQdrantClient as any);

      // Mock embeddings
      const mockEmbeddings = {};
      MockedGoogleGenerativeAIEmbeddings.mockImplementation(() => mockEmbeddings as any);

      // Mock QdrantVectorStore
      MockedQdrantVectorStore.fromDocuments = jest.fn().mockResolvedValue(undefined);

      // Import and run the main function
      const { main } = await import("./index-code");
      await main();

      // Verify the process completed without errors
      expect(MockedDirectoryLoader).toHaveBeenCalledWith(
        "./test-src",
        expect.objectContaining({
          ".ts": expect.any(Function),
          ".js": expect.any(Function)
        }),
        true,
        "ignore"
      );
      expect(mockDirectoryLoader.load).toHaveBeenCalled();
      expect(MockedQdrantVectorStore.fromDocuments).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("Indexing process completed successfully.");
    });
  });

  describe("Edge cases", () => {
    test("should handle empty document list gracefully", async () => {
      process.env.GOOGLE_API_KEY = "test-api-key";

      const mockDirectoryLoader = {
        load: jest.fn().mockResolvedValue([])
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      const { main } = await import("./index-code");
      await main();

      expect(consoleLogSpy).toHaveBeenCalledWith("No documents found to index. Exiting.");
      expect(MockedQdrantVectorStore.fromDocuments).not.toHaveBeenCalled();
    });

    test("should handle documents that fail to split gracefully", async () => {
      process.env.GOOGLE_API_KEY = "test-api-key";

      const mockDocs = [
        new Document({
          pageContent: "valid content",
          metadata: { source: "valid.ts" }
        }),
        new Document({
          pageContent: "invalid content",
          metadata: { source: "invalid.ts" }
        })
      ];

      const mockDirectoryLoader = {
        load: jest.fn().mockResolvedValue(mockDocs)
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      const mockTextSplitter = {
        splitText: jest.fn()
          .mockResolvedValueOnce(["valid chunk"])
          .mockRejectedValueOnce(new Error("Split failed"))
      };
      MockedCharacterTextSplitter.mockImplementation(() => mockTextSplitter as any);

      const mockQdrantClient = {
        getCollections: jest.fn().mockResolvedValue({
          collections: []
        }),
        createCollection: jest.fn().mockResolvedValue(undefined)
      };
      MockedQdrantClient.mockImplementation(() => mockQdrantClient as any);

      MockedGoogleGenerativeAIEmbeddings.mockImplementation(() => ({} as any));
      MockedQdrantVectorStore.fromDocuments = jest.fn().mockResolvedValue(undefined);

      const { main } = await import("./index-code");
      await main();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error splitting document invalid.ts:",
        expect.any(Error)
      );
      expect(MockedQdrantVectorStore.fromDocuments).toHaveBeenCalled();
    });

    test("should create collection when it doesn't exist", async () => {
      process.env.GOOGLE_API_KEY = "test-api-key";
      process.env.QDRANT_COLLECTION_NAME = "new_collection";

      const mockDocs = [
        new Document({
          pageContent: "test content",
          metadata: { source: "test.ts" }
        })
      ];

      const mockDirectoryLoader = {
        load: jest.fn().mockResolvedValue(mockDocs)
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      const mockTextSplitter = {
        splitText: jest.fn().mockResolvedValue(["chunk1"])
      };
      MockedCharacterTextSplitter.mockImplementation(() => mockTextSplitter as any);

      const mockQdrantClient = {
        getCollections: jest.fn().mockResolvedValue({
          collections: [{ name: "existing_collection" }]
        }),
        createCollection: jest.fn().mockResolvedValue(undefined)
      };
      MockedQdrantClient.mockImplementation(() => mockQdrantClient as any);

      MockedGoogleGenerativeAIEmbeddings.mockImplementation(() => ({} as any));
      MockedQdrantVectorStore.fromDocuments = jest.fn().mockResolvedValue(undefined);

      const { main } = await import("./index-code");
      await main();

      expect(mockQdrantClient.createCollection).toHaveBeenCalledWith("new_collection", {
        vectors: {
          size: 768,
          distance: "Cosine"
        }
      });
    });
  });

  describe("Failure scenarios", () => {
    test("should exit when GOOGLE_API_KEY is not set", async () => {
      delete process.env.GOOGLE_API_KEY;

      const { main } = await import("./index-code");
      await main();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: GOOGLE_API_KEY is not set in the environment variables."
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test("should exit when document loading fails", async () => {
      process.env.GOOGLE_API_KEY = "test-api-key";

      const mockDirectoryLoader = {
        load: jest.fn().mockRejectedValue(new Error("Loading failed"))
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      const { main } = await import("./index-code");
      await main();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading documents:",
        expect.any(Error)
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test("should exit when Qdrant connection fails", async () => {
      process.env.GOOGLE_API_KEY = "test-api-key";

      const mockDocs = [
        new Document({
          pageContent: "test content",
          metadata: { source: "test.ts" }
        })
      ];

      const mockDirectoryLoader = {
        load: jest.fn().mockResolvedValue(mockDocs)
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      const mockTextSplitter = {
        splitText: jest.fn().mockResolvedValue(["chunk1"])
      };
      MockedCharacterTextSplitter.mockImplementation(() => mockTextSplitter as any);

      const mockQdrantClient = {
        getCollections: jest.fn().mockRejectedValue(new Error("Connection failed"))
      };
      MockedQdrantClient.mockImplementation(() => mockQdrantClient as any);

      MockedGoogleGenerativeAIEmbeddings.mockImplementation(() => ({} as any));

      const { main } = await import("./index-code");
      await main();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error connecting to Qdrant or creating collection:",
        expect.any(Error)
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test("should handle errors when adding documents to Qdrant", async () => {
      process.env.GOOGLE_API_KEY = "test-api-key";

      const mockDocs = [
        new Document({
          pageContent: "test content",
          metadata: { source: "test.ts" }
        })
      ];

      const mockDirectoryLoader = {
        load: jest.fn().mockResolvedValue(mockDocs)
      };
      MockedDirectoryLoader.mockImplementation(() => mockDirectoryLoader as any);

      const mockTextSplitter = {
        splitText: jest.fn().mockResolvedValue(["chunk1"])
      };
      MockedCharacterTextSplitter.mockImplementation(() => mockTextSplitter as any);

      const mockQdrantClient = {
        getCollections: jest.fn().mockResolvedValue({
          collections: []
        }),
        createCollection: jest.fn().mockResolvedValue(undefined)
      };
      MockedQdrantClient.mockImplementation(() => mockQdrantClient as any);

      MockedGoogleGenerativeAIEmbeddings.mockImplementation(() => ({} as any));
      MockedQdrantVectorStore.fromDocuments = jest.fn().mockRejectedValue(new Error("Failed to add documents"));

      const { main } = await import("./index-code");

      await expect(main()).rejects.toThrow("Failed to add documents");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error adding documents to Qdrant:",
        expect.any(Error)
      );
    });
  });
}); 