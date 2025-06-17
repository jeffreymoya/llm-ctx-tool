import { CodebaseSchema, ParsedFileSchema } from '../CodebaseSchemaValidator.ts';

describe('CodebaseSchemaValidator', () => {
  describe('ParsedFileSchema', () => {
    it('validates a valid parsed file', () => {
      const validFile = {
        filePath: '/path/to/file.ts',
        ast: { type: 'Program', body: [] },
        definitions: {
          functions: ['myFunction'],
          classes: ['MyClass'],
          variables: ['myVar'],
        },
        imports: ['fs', 'path'],
        exports: ['MyClass'],
        codeSnippet: 'export class MyClass {}',
        startLine: 1,
        endLine: 10,
      };
      expect(() => ParsedFileSchema.parse(validFile)).not.toThrow();
    });

    it('validates a parsed file with errors', () => {
      const fileWithErrors = {
        filePath: '/path/to/broken.ts',
        ast: null,
        definitions: {
          functions: [],
          classes: [],
          variables: [],
        },
        imports: [],
        exports: [],
        errors: ['Syntax error at line 5'],
        codeSnippet: '',
        startLine: 1,
        endLine: 1,
      };
      expect(() => ParsedFileSchema.parse(fileWithErrors)).not.toThrow();
    });

    it('rejects invalid parsed file data', () => {
      const invalidFile = {
        filePath: 123,
        ast: { type: 'Program' },
        definitions: {
          functions: 'not an array',
          classes: [],
          variables: [],
        },
        imports: [],
        exports: [],
        codeSnippet: 'code',
        startLine: 'not a number',
        endLine: 10,
      };
      expect(() => ParsedFileSchema.parse(invalidFile)).toThrow();
    });
  });

  describe('CodebaseSchema', () => {
    it('validates a valid codebase result', () => {
      const validCodebase = {
        files: [
          {
            filePath: '/file1.ts',
            ast: { type: 'Program', body: [] },
            definitions: { functions: [], classes: [], variables: [] },
            imports: [],
            exports: [],
            codeSnippet: '',
            startLine: 1,
            endLine: 1,
          },
        ],
        structure: { src: { 'file1.ts': { type: 'file' } } },
        errors: [],
      };
      expect(() => CodebaseSchema.parse(validCodebase)).not.toThrow();
    });

    it('validates a codebase result with errors', () => {
      const codebaseWithErrors = {
        files: [],
        structure: {},
        errors: [{ file: '/broken.ts', error: 'Parse error' }],
      };
      expect(() => CodebaseSchema.parse(codebaseWithErrors)).not.toThrow();
    });

    it('rejects invalid codebase data', () => {
      const invalidCodebase = {
        files: 'not an array',
        structure: {},
        errors: [],
      };
      expect(() => CodebaseSchema.parse(invalidCodebase)).toThrow();
    });
  });
});
