# LLM Context Tool

A powerful RAG (Retrieval-Augmented Generation) pipeline for indexing and querying codebases using Google Gemini embeddings and Qdrant vector database.

## Features

- **Code Indexing**: Automatically process and index TypeScript and JavaScript files
- **Google Gemini Embeddings**: Leverage Google's advanced text-embedding-004 model for high-quality vector representations
- **Qdrant Integration**: Store and query embeddings using the powerful Qdrant vector database
- **Semantic Search**: Find relevant code snippets using natural language queries
- **Configurable Chunking**: Customize text splitting parameters for optimal performance

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose (for Qdrant)
- Google API Key for Gemini embeddings

## Quick Start

### 1. Get Google API Key

1. Visit [Google AI Studio](https://ai.google.dev/tutorials/setup)
2. Create or sign in to your Google account
3. Generate an API key
4. Copy the API key for use in environment variables

### 2. Setup Environment

Create a `.env` file in the project root:

```bash
# Required
GOOGLE_API_KEY=your_google_api_key_here

# Optional (defaults provided)
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=code_snippets
SOURCE_DIR=./src
CHUNK_SIZE=800
CHUNK_OVERLAP=100
EMBEDDING_MODEL=text-embedding-004
EMBEDDING_DIMENSIONS=768
BATCH_SIZE=32
```

### 3. Start Qdrant

```bash
docker-compose up -d
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Index Your Code

```bash
# Index files in the default ./src directory
ts-node scripts/index-code.ts

# Or specify a custom directory via environment variable
SOURCE_DIR=./my-code ts-node scripts/index-code.ts
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | **Required** - Google API key for Gemini embeddings | - |
| `QDRANT_URL` | Qdrant instance URL | `http://localhost:6333` |
| `QDRANT_COLLECTION_NAME` | Collection name in Qdrant | `code_snippets` |
| `SOURCE_DIR` | Directory to scan for code files | `./src` |
| `CHUNK_SIZE` | Maximum characters per text chunk | `800` |
| `CHUNK_OVERLAP` | Character overlap between chunks | `100` |
| `EMBEDDING_MODEL` | Google embedding model to use | `text-embedding-004` |
| `EMBEDDING_DIMENSIONS` | Vector dimensions (model-specific) | `768` |
| `BATCH_SIZE` | Processing batch size | `32` |

### Supported File Types

- TypeScript files (`.ts`)
- JavaScript files (`.js`)

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Source Code   │ -> │   Text Splitter  │ -> │ Gemini Embeddings│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐              │
│ Semantic Search │ <- │     Qdrant       │ <────────────┘
└─────────────────┘    └──────────────────┘
```

## Development

### Running Tests

```bash
npm test
```

### Code Standards

This project follows strict TypeScript coding standards:
- Explicit type annotations
- Comprehensive JSDoc documentation
- Unit tests for all functionality
- ESLint and Prettier configuration
- Error handling with typed exceptions

### Project Structure

```
.
├── scripts/
│   ├── index-code.ts       # Main indexing script
│   └── index-code.spec.ts  # Unit tests
├── src/                    # Source code to be indexed
├── docker-compose.yml      # Qdrant service configuration
└── package.json           # Dependencies and scripts
```

## Embedding Models

### Default: text-embedding-004

- **Dimensions**: 768
- **Use Case**: General-purpose text embedding
- **Task Type**: RETRIEVAL_DOCUMENT (optimized for indexing)

### Alternative Models

You can use other Google embedding models by setting the `EMBEDDING_MODEL` environment variable:

- `text-embedding-004` (default)
- `embedding-001`

Remember to adjust `EMBEDDING_DIMENSIONS` accordingly.

## Troubleshooting

### Common Issues

1. **Missing Google API Key**
   ```
   Error: GOOGLE_API_KEY is not set in the environment variables.
   ```
   Solution: Ensure your `.env` file contains a valid Google API key.

2. **Qdrant Connection Failed**
   ```
   Error connecting to Qdrant or creating collection
   ```
   Solution: Ensure Qdrant is running via `docker-compose up -d`.

3. **No Documents Found**
   ```
   No documents found to index. Exiting.
   ```
   Solution: Check that `SOURCE_DIR` points to a directory containing `.ts` or `.js` files.

### Debugging

Enable verbose logging by running with debug flags:

```bash
DEBUG=* ts-node scripts/index-code.ts
```

## Performance Optimization

- **Chunk Size**: Smaller chunks provide more granular search but require more storage
- **Batch Size**: Larger batches improve throughput but use more memory
- **Overlap**: Prevents context loss at chunk boundaries

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the coding standards
4. Add comprehensive tests
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the [Google AI documentation](https://ai.google.dev/)
- Open an issue on GitHub 