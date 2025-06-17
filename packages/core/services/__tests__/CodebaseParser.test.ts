import 'reflect-metadata';
import { promises as fs } from 'fs';
import { join } from 'path';

import { container } from 'tsyringe';

import type { Logger } from '../../../ports/index.ts';
import { ParsedFileSchema } from '../../validators/CodebaseSchemaValidator.ts';
import { CodebaseParser } from '../CodebaseParser.ts';

// Create typed mock functions
const mockDebug = jest.fn();
const mockInfo = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();

const mockLogger: Logger = {
  debug: mockDebug,
  info: mockInfo,
  warn: mockWarn,
  error: mockError,
};

describe('CodebaseParser', () => {
  let parser: CodebaseParser;
  const testFixturesPath = join(__dirname, 'fixtures');

  beforeEach(() => {
    container.clearInstances();
    container.registerInstance<Logger>('Logger', mockLogger);
    parser = container.resolve(CodebaseParser);
    jest.clearAllMocks();
  });

  describe('parse', () => {
    it('should parse a simple TypeScript file', async () => {
      const validTsFixture = join(testFixturesPath, 'valid-ts', 'sample.ts');
      const content = await fs.readFile(validTsFixture, 'utf-8');

      const result = parser.parse(validTsFixture, content);

      expect(result.filePath).toBe(validTsFixture);
      expect(result.definitions).toBeDefined();
      expect(result.imports).toBeDefined();
      expect(result.exports).toBeDefined();
      expect(result.codeSnippet).toBeDefined();
      expect(result.startLine).toBe(1);
      expect(result.endLine).toBeGreaterThan(0);
    });

    it('should handle malformed TypeScript files', async () => {
      const malformedFixture = join(testFixturesPath, 'malformed', 'broken.ts');
      const content = await fs.readFile(malformedFixture, 'utf-8');

      const result = parser.parse(malformedFixture, content);

      expect(result.filePath).toBe(malformedFixture);
      expect(result.diagnostics).toBeDefined();
      expect(result.diagnostics?.length ?? 0).toBeGreaterThan(0);
    });

    it('should extract function definitions', async () => {
      const validTsFixture = join(testFixturesPath, 'valid-ts', 'sample.ts');
      const content = await fs.readFile(validTsFixture, 'utf-8');

      const result = parser.parse(validTsFixture, content);

      expect(result.definitions.functions).toBeDefined();
      expect(Array.isArray(result.definitions.functions)).toBe(true);
    });

    it('should extract import statements', async () => {
      const validTsFixture = join(testFixturesPath, 'valid-ts', 'sample.ts');
      const content = await fs.readFile(validTsFixture, 'utf-8');

      const result = parser.parse(validTsFixture, content);

      expect(result.imports).toBeDefined();
      expect(Array.isArray(result.imports)).toBe(true);
    });

    it('should validate parsed output', async () => {
      const validTsFixture = join(testFixturesPath, 'valid-ts', 'sample.ts');
      const content = await fs.readFile(validTsFixture, 'utf-8');

      const result = parser.parse(validTsFixture, content);

      // Use the Zod schema directly for validation
      const validationResult = ParsedFileSchema.safeParse(result);
      expect(validationResult.success).toBe(true);
    });
  });

  describe('parseStream', () => {
    it('should parse all TypeScript files in a directory', async () => {
      const largeNestedFixture = join(testFixturesPath, 'large-nested');
      const results = [];

      for await (const parsedFile of parser.parseStream(largeNestedFixture)) {
        results.push(parsedFile);
      }

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => result.filePath.includes(largeNestedFixture))).toBe(true);
    });

    it('should handle errors gracefully during streaming', async () => {
      const mixedFixture = testFixturesPath; // Contains both valid and malformed files

      const results = [];
      for await (const parsedFile of parser.parseStream(mixedFixture)) {
        results.push(parsedFile);
      }

      expect(results.length).toBeGreaterThan(0);
      expect(mockError).toHaveBeenCalled();
    });

    it('should log start and end messages', async () => {
      const validTsFixture = join(testFixturesPath, 'valid-ts');

      const results = [];
      for await (const parsedFile of parser.parseStream(validTsFixture)) {
        results.push(parsedFile);
      }

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('Starting codebase stream parse'),
      );
      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('Finished codebase stream parse'),
      );
    });
  });

  describe('complex parsing scenarios', () => {
    it('should handle large nested project structure', async () => {
      const largeNestedFixture = join(testFixturesPath, 'large-nested');
      const results = [];

      for await (const parsedFile of parser.parseStream(largeNestedFixture)) {
        results.push(parsedFile);
      }

      expect(results.length).toBeGreaterThan(5); // Should have multiple files

      // Check that we have parsed files from different modules
      const filePaths = results.map((r) => r.filePath);
      expect(filePaths.some((p) => p.includes('module1'))).toBe(true);
      expect(filePaths.some((p) => p.includes('module2'))).toBe(true);
      expect(filePaths.some((p) => p.includes('module3'))).toBe(true);
    });

    it('should extract complex definitions', async () => {
      const largeNestedFixture = join(testFixturesPath, 'large-nested');
      const results = [];

      for await (const parsedFile of parser.parseStream(largeNestedFixture)) {
        results.push(parsedFile);
      }

      // Find a specific parsed file to check its structure
      const parsedFile = results.find((r) => r.filePath.includes('file1.ts'));
      expect(parsedFile).toBeDefined();
      expect(parsedFile?.definitions).toBeDefined();
    });
  });
});
